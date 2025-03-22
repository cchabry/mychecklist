
import { Audit, ComplianceStatus, AuditItem } from '@/lib/types';
import { notionClient, NotionAPIListResponse, NotionAPIPage } from './client';
import { cacheService } from '../cache';

// Clés de cache pour les audits
const PROJECT_AUDITS_PREFIX = 'notion_project_audits_';
const AUDIT_PREFIX = 'notion_audit_';
const AUDIT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Service de gestion des audits via Notion
 */
export const auditsService = {
  /**
   * Récupère tous les audits pour un projet
   */
  async getAuditsByProject(projectId: string, forceRefresh = false): Promise<Audit[]> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedAudits = cacheService.get<Audit[]>(`${PROJECT_AUDITS_PREFIX}${projectId}`);
      if (cachedAudits) {
        console.log(`Audits pour le projet ${projectId} récupérés depuis le cache`);
        return cachedAudits;
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
      
      // Pour l'instant, nous simulerons avec une requête filtrée sur la base de projets
      // Cette partie sera à remplacer par la vraie implémentation une fois la DB d'audits créée
      
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
        console.warn("Base de données des audits non configurée ou erreur d'accès");
        return [];
      }
      
      // Mapper les résultats en audits
      const audits = response.data.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          projectId: projectId,
          name: properties.Name?.title?.[0]?.plain_text || 
                properties.name?.title?.[0]?.plain_text || 
                `Audit - ${new Date(page.created_time).toLocaleDateString()}`,
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
          completedAt: properties.CompletedAt?.date?.start || null,
          score: properties.Score?.number || 0,
          version: properties.Version?.rich_text?.[0]?.plain_text || '1.0',
          items: [] // Les items seront chargés séparément
        };
      });
      
      // Sauvegarder dans le cache
      cacheService.set(`${PROJECT_AUDITS_PREFIX}${projectId}`, audits, AUDIT_CACHE_TTL);
      
      return audits;
    } catch (error) {
      console.error(`Erreur lors de la récupération des audits pour le projet ${projectId}:`, error);
      // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
      return [];
    }
  },
  
  /**
   * Récupère un audit par son ID
   */
  async getAudit(auditId: string, forceRefresh = false): Promise<Audit | null> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedAudit = cacheService.get<Audit>(`${AUDIT_PREFIX}${auditId}`);
      if (cachedAudit) {
        console.log(`Audit ${auditId} récupéré depuis le cache`);
        return cachedAudit;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Récupérer les données de base de l'audit
      const response = await notionClient.get<NotionAPIPage>(`/pages/${auditId}`);
      
      if (!response.success) {
        console.error('Erreur Notion lors de la récupération de l\'audit:', response.error);
        return null;
      }
      
      const data = response.data;
      const properties = data.properties;
      
      // Récupérer l'ID du projet depuis les propriétés
      const projectId = properties.ProjectId?.rich_text?.[0]?.plain_text || 
                         properties.projectId?.rich_text?.[0]?.plain_text || '';
      
      // Créer l'objet audit de base
      const audit: Audit = {
        id: data.id,
        projectId: projectId,
        name: properties.Name?.title?.[0]?.plain_text || 
              properties.name?.title?.[0]?.plain_text || 
              `Audit - ${new Date(data.created_time).toLocaleDateString()}`,
        createdAt: data.created_time,
        updatedAt: data.last_edited_time,
        completedAt: properties.CompletedAt?.date?.start || null,
        score: properties.Score?.number || 0,
        version: properties.Version?.rich_text?.[0]?.plain_text || '1.0',
        items: [] // Les items seront chargés dans une autre étape
      };
      
      // À ce stade, nous devrions charger les items de l'audit
      // Mais cela dépend de la structure de la base de données Notion
      // Pour l'instant, nous retournerons l'audit sans ses items
      
      // Sauvegarder dans le cache
      cacheService.set(`${AUDIT_PREFIX}${auditId}`, audit, AUDIT_CACHE_TTL);
      
      return audit;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'audit ${auditId}:`, error);
      return null;
    }
  },
  
  /**
   * Crée un nouvel audit pour un projet
   */
  async createAudit(projectId: string, auditData: Partial<Audit>): Promise<Audit | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const dbId = localStorage.getItem('notion_database_id');
      if (!dbId) {
        throw new Error('ID de base de données Notion manquant');
      }
      
      // Préparer les propriétés pour la création
      const properties: any = {
        "Name": { title: [{ text: { content: auditData.name || `Nouvel audit - ${new Date().toLocaleDateString()}` } }] },
        "ProjectId": { rich_text: [{ text: { content: projectId } }] },
        "Score": { number: 0 },
        "Version": { rich_text: [{ text: { content: auditData.version || '1.0' } }] }
      };
      
      const response = await notionClient.post<NotionAPIPage>('/pages', {
        parent: { database_id: dbId },
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la création de l\'audit');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${PROJECT_AUDITS_PREFIX}${projectId}`);
      
      // Récupérer l'audit créé
      const newAuditId = response.data.id;
      return await this.getAudit(newAuditId, true);
    } catch (error) {
      console.error(`Erreur lors de la création d'un audit pour le projet ${projectId}:`, error);
      throw error;
    }
  },
  
  /**
   * Met à jour un audit existant
   */
  async updateAudit(auditId: string, data: Partial<Audit>): Promise<Audit | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Préparer les propriétés pour la mise à jour
      const properties: any = {};
      
      if (data.name) {
        properties["Name"] = { title: [{ text: { content: data.name } }] };
      }
      
      if (data.score !== undefined) {
        properties["Score"] = { number: data.score };
      }
      
      if (data.completedAt) {
        properties["CompletedAt"] = { date: { start: data.completedAt } };
      }
      
      if (data.version) {
        properties["Version"] = { rich_text: [{ text: { content: data.version } }] };
      }
      
      const response = await notionClient.patch(`/pages/${auditId}`, {
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la mise à jour de l\'audit');
      }
      
      // Si l'audit a des items qui doivent être mis à jour, ce serait ici
      // Mais cela dépend de la structure de la base de données
      
      // Invalider les caches concernés
      cacheService.remove(`${AUDIT_PREFIX}${auditId}`);
      if (data.projectId) {
        cacheService.remove(`${PROJECT_AUDITS_PREFIX}${data.projectId}`);
      }
      
      // Récupérer l'audit mis à jour
      return await this.getAudit(auditId, true);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'audit ${auditId}:`, error);
      throw error;
    }
  },
  
  /**
   * Met à jour un item d'audit spécifique
   */
  async updateAuditItem(auditId: string, itemId: string, data: Partial<AuditItem>): Promise<boolean> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Cette méthode dépendra de la façon dont les items d'audit sont stockés dans Notion
      // Pour l'instant, nous simulerons un succès
      
      // Invalider le cache de l'audit
      cacheService.remove(`${AUDIT_PREFIX}${auditId}`);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'item ${itemId} de l'audit ${auditId}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime un audit (archive dans Notion)
   */
  async deleteAudit(auditId: string, projectId?: string): Promise<boolean> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Dans Notion, on ne peut pas vraiment supprimer, on archive
      const response = await notionClient.patch(`/pages/${auditId}`, {
        archived: true
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la suppression de l\'audit');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${AUDIT_PREFIX}${auditId}`);
      if (projectId) {
        cacheService.remove(`${PROJECT_AUDITS_PREFIX}${projectId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'audit ${auditId}:`, error);
      throw error;
    }
  }
};
