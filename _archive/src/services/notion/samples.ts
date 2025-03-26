
import { SamplePage } from '@/lib/types';
import { notionClient, NotionAPIListResponse } from './client';
import { cacheService } from '../cache';

// Clés de cache pour les pages d'échantillon
const SAMPLE_PAGES_PREFIX = 'notion_sample_pages_';
const SAMPLE_PAGES_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Service de gestion des pages d'échantillon via Notion
 */
export const samplesService = {
  /**
   * Récupère toutes les pages d'échantillon pour un projet
   */
  async getPagesByProject(projectId: string, forceRefresh = false): Promise<SamplePage[]> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedPages = cacheService.get<SamplePage[]>(`${SAMPLE_PAGES_PREFIX}${projectId}`);
      if (cachedPages) {
        console.log(`Pages d'échantillon pour le projet ${projectId} récupérées depuis le cache`);
        return cachedPages;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const dbId = localStorage.getItem('notion_database_id');
      if (!dbId) {
        throw new Error('ID de base de données Notion manquant');
      }
      
      // Quand nous aurons une base de données dédiée aux pages d'échantillon:
      // const samplesDbId = localStorage.getItem('notion_samples_database_id');
      
      // Pour l'instant, nous simulerons avec une requête filtrée sur la base de projets
      // Cette partie sera à remplacer par la vraie implémentation une fois la DB créée
      
      const response = await notionClient.post<NotionAPIListResponse>(`/databases/${dbId}/query`, {
        filter: {
          property: "ProjectId",
          rich_text: {
            equals: projectId
          }
        }
      });
      
      if (!response.success) {
        // Si nous n'avons pas encore de base de données dédiée, retourner un tableau vide
        console.warn("Base de données des pages d'échantillon non configurée ou erreur d'accès");
        return [];
      }
      
      // Mapper les résultats en pages d'échantillon
      const pages = response.data.results.map((page: any, index: number) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          projectId: projectId,
          url: properties.URL?.url || properties.url?.url || '',
          title: properties.Title?.title?.[0]?.plain_text || 
                 properties.title?.title?.[0]?.plain_text || 
                 `Page ${index + 1}`,
          description: properties.Description?.rich_text?.[0]?.plain_text || '',
          order: properties.Order?.number || index
        };
      });
      
      // Sauvegarder dans le cache
      cacheService.set(`${SAMPLE_PAGES_PREFIX}${projectId}`, pages, SAMPLE_PAGES_TTL);
      
      return pages;
    } catch (error) {
      console.error(`Erreur lors de la récupération des pages d'échantillon pour le projet ${projectId}:`, error);
      // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
      return [];
    }
  },
  
  /**
   * Ajoute une page à l'échantillon d'un projet
   */
  async addPage(projectId: string, pageData: Omit<SamplePage, 'id' | 'projectId'>): Promise<SamplePage | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // À implémenter lorsque nous aurons une base de données dédiée
      // Pour l'instant, retourner une page simulée
      const newPage: SamplePage = {
        id: `sample-${Date.now()}`,
        projectId,
        ...pageData
      };
      
      // Invalider le cache des pages d'échantillon pour ce projet
      cacheService.remove(`${SAMPLE_PAGES_PREFIX}${projectId}`);
      
      return newPage;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'une page d'échantillon au projet ${projectId}:`, error);
      throw error;
    }
  },
  
  /**
   * Met à jour une page d'échantillon
   */
  async updatePage(pageId: string, projectId: string, data: Partial<SamplePage>): Promise<SamplePage | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // À implémenter lorsque nous aurons une base de données dédiée
      // Pour l'instant, invalider le cache et retourner null
      cacheService.remove(`${SAMPLE_PAGES_PREFIX}${projectId}`);
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la page d'échantillon ${pageId}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime une page d'échantillon
   */
  async deletePage(pageId: string, projectId: string): Promise<boolean> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // À implémenter lorsque nous aurons une base de données dédiée
      // Pour l'instant, invalider le cache et retourner true
      cacheService.remove(`${SAMPLE_PAGES_PREFIX}${projectId}`);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la page d'échantillon ${pageId}:`, error);
      throw error;
    }
  }
};
