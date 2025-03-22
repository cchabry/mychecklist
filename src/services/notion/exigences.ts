
import { Exigence, ImportanceLevel } from '@/lib/types';
import { notionClient, NotionAPIListResponse, NotionAPIPage } from './client';
import { cacheService } from '../cache';

// Clés de cache pour les exigences
const PROJECT_EXIGENCES_PREFIX = 'notion_project_exigences_';
const EXIGENCE_CACHE_PREFIX = 'notion_exigence_';
const EXIGENCE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Service de gestion des exigences via Notion
 */
export const exigencesService = {
  /**
   * Récupère toutes les exigences pour un projet
   */
  async getExigencesByProject(projectId: string, forceRefresh = false): Promise<Exigence[]> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedExigences = cacheService.get<Exigence[]>(`${PROJECT_EXIGENCES_PREFIX}${projectId}`);
      if (cachedExigences) {
        console.log(`Exigences pour le projet ${projectId} récupérées depuis le cache`);
        return cachedExigences;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const exigencesDbId = localStorage.getItem('notion_exigences_database_id');
      if (!exigencesDbId) {
        throw new Error('ID de base de données des exigences Notion manquant');
      }
      
      // Faire la requête à l'API Notion avec un filtre sur le projet
      const response = await notionClient.post<NotionAPIListResponse>(`/databases/${exigencesDbId}/query`, {
        filter: {
          property: "ProjectId",
          rich_text: {
            equals: projectId
          }
        }
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la récupération des exigences');
      }
      
      // Mapper les résultats en exigences
      const exigences = response.data.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          projectId: projectId,
          itemId: properties.ItemId?.rich_text?.[0]?.plain_text || '',
          importance: (properties.Importance?.select?.name || 
                      properties.importance?.select?.name || 'Moyen') as ImportanceLevel,
          comment: properties.Comment?.rich_text?.[0]?.plain_text || 
                  properties.comment?.rich_text?.[0]?.plain_text || 
                  properties.Commentaire?.rich_text?.[0]?.plain_text || ''
        };
      });
      
      // Sauvegarder dans le cache
      cacheService.set(`${PROJECT_EXIGENCES_PREFIX}${projectId}`, exigences, EXIGENCE_CACHE_TTL);
      
      return exigences;
    } catch (error) {
      console.error(`Erreur lors de la récupération des exigences pour le projet ${projectId}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère une exigence par son ID
   */
  async getExigence(id: string, forceRefresh = false): Promise<Exigence | null> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedExigence = cacheService.get<Exigence>(`${EXIGENCE_CACHE_PREFIX}${id}`);
      if (cachedExigence) {
        console.log(`Exigence ${id} récupérée depuis le cache`);
        return cachedExigence;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Faire la requête à l'API Notion
      const response = await notionClient.get<NotionAPIPage>(`/pages/${id}`);
      
      if (!response.success) {
        console.error('Erreur Notion lors de la récupération de l\'exigence:', response.error);
        return null;
      }
      
      const data = response.data;
      const properties = data.properties;
      
      // Extraire les informations de l'exigence
      const exigence: Exigence = {
        id: data.id,
        projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
        itemId: properties.ItemId?.rich_text?.[0]?.plain_text || '',
        importance: (properties.Importance?.select?.name || 
                    properties.importance?.select?.name || 'Moyen') as ImportanceLevel,
        comment: properties.Comment?.rich_text?.[0]?.plain_text || 
                properties.comment?.rich_text?.[0]?.plain_text || 
                properties.Commentaire?.rich_text?.[0]?.plain_text || ''
      };
      
      // Sauvegarder dans le cache
      cacheService.set(`${EXIGENCE_CACHE_PREFIX}${id}`, exigence, EXIGENCE_CACHE_TTL);
      
      return exigence;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'exigence ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Crée une nouvelle exigence pour un projet
   */
  async createExigence(data: Omit<Exigence, 'id'>): Promise<Exigence | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const exigencesDbId = localStorage.getItem('notion_exigences_database_id');
      if (!exigencesDbId) {
        throw new Error('ID de base de données des exigences Notion manquant');
      }
      
      // Préparer les propriétés pour la création
      const properties: any = {
        "ProjectId": { rich_text: [{ text: { content: data.projectId } }] },
        "ItemId": { rich_text: [{ text: { content: data.itemId } }] },
        "Importance": { select: { name: data.importance } },
      };
      
      // Ajouter le commentaire si fourni
      if (data.comment) {
        properties["Comment"] = { 
          rich_text: [{ text: { content: data.comment } }] 
        };
      }
      
      const response = await notionClient.post<NotionAPIPage>('/pages', {
        parent: { database_id: exigencesDbId },
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la création de l\'exigence');
      }
      
      // Invalider le cache des exigences pour ce projet
      cacheService.remove(`${PROJECT_EXIGENCES_PREFIX}${data.projectId}`);
      
      // Récupérer l'exigence créée
      return await this.getExigence(response.data.id, true);
    } catch (error) {
      console.error('Erreur lors de la création de l\'exigence:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour une exigence existante
   */
  async updateExigence(id: string, data: Partial<Exigence>): Promise<Exigence | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Préparer les propriétés pour la mise à jour
      const properties: any = {};
      
      if (data.importance) {
        properties["Importance"] = { select: { name: data.importance } };
      }
      
      if (data.comment !== undefined) {
        properties["Comment"] = { 
          rich_text: data.comment ? [{ text: { content: data.comment } }] : [] 
        };
      }
      
      const response = await notionClient.patch(`/pages/${id}`, {
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la mise à jour de l\'exigence');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${EXIGENCE_CACHE_PREFIX}${id}`);
      if (data.projectId) {
        cacheService.remove(`${PROJECT_EXIGENCES_PREFIX}${data.projectId}`);
      }
      
      // Récupérer l'exigence mise à jour
      return await this.getExigence(id, true);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'exigence ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime une exigence (archive dans Notion)
   */
  async deleteExigence(id: string, projectId?: string): Promise<boolean> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Dans Notion, on ne peut pas vraiment supprimer, on archive
      const response = await notionClient.patch(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la suppression de l\'exigence');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${EXIGENCE_CACHE_PREFIX}${id}`);
      if (projectId) {
        cacheService.remove(`${PROJECT_EXIGENCES_PREFIX}${projectId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'exigence ${id}:`, error);
      throw error;
    }
  }
};
