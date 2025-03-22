import { Project } from '@/lib/types';
import { notionClient, NotionAPIListResponse, NotionAPIPage } from './client';
import { cacheService } from '../cache';

// Clé de cache pour les projets
const PROJECTS_CACHE_KEY = 'notion_projects';
const PROJECT_CACHE_PREFIX = 'notion_project_';
const PROJECT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Service de gestion des projets via Notion
 */
export const projectsService = {
  /**
   * Récupère tous les projets depuis Notion ou le cache
   */
  async getProjects(forceRefresh = false): Promise<Project[]> {
    // Vérifier si nous avons des données en cache et si nous ne forçons pas le rafraîchissement
    if (!forceRefresh) {
      const cachedProjects = cacheService.get<Project[]>(PROJECTS_CACHE_KEY);
      if (cachedProjects) {
        console.log('Projets récupérés depuis le cache');
        return cachedProjects;
      }
    }
    
    // Si pas en cache ou rafraîchissement forcé, récupérer depuis Notion
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      const dbId = localStorage.getItem('notion_database_id');
      if (!dbId) {
        throw new Error('ID de base de données Notion manquant');
      }
      
      // Faire la requête à l'API Notion
      const response = await notionClient.post<NotionAPIListResponse>(`/databases/${dbId}/query`, {});
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la récupération des projets');
      }
      
      // Mapper les résultats en projets
      const projects = response.data.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          name: properties.Name?.title?.[0]?.plain_text || 
                properties.name?.title?.[0]?.plain_text || 'Sans titre',
          url: properties.URL?.url || 
               properties.url?.url || 
               properties.Url?.url || '',
          description: properties.Description?.rich_text?.[0]?.plain_text || 
                       properties.description?.rich_text?.[0]?.plain_text || '',
          status: properties.Status?.select?.name || 
                  properties.status?.select?.name || 'Non démarré',
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
          progress: properties.Progress?.number || 
                    properties.progress?.number || 0,
          itemsCount: properties.ItemsCount?.number || 
                      properties.itemsCount?.number ||
                      properties.Nombre?.number || 15
        };
      });
      
      // Sauvegarder dans le cache
      cacheService.set(PROJECTS_CACHE_KEY, projects, PROJECT_CACHE_TTL);
      
      return projects;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un projet par son ID
   */
  async getProject(id: string, forceRefresh = false): Promise<Project | null> {
    // Nettoyage de l'ID pour assurer la cohérence
    const cleanId = id.trim();
    
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      const cachedProject = cacheService.get<Project>(`${PROJECT_CACHE_PREFIX}${cleanId}`);
      if (cachedProject) {
        console.log(`Projet ${cleanId} récupéré depuis le cache`);
        return cachedProject;
      }
    }
    
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Faire la requête à l'API Notion
      const response = await notionClient.get<NotionAPIPage>(`/pages/${cleanId}`);
      
      if (!response.success) {
        console.error('Erreur Notion lors de la récupération du projet:', response.error);
        return null;
      }
      
      const data = response.data;
      const properties = data.properties;
      
      const project: Project = {
        id: data.id,
        name: properties.Name?.title?.[0]?.plain_text || 
              properties.name?.title?.[0]?.plain_text || 'Sans titre',
        url: properties.URL?.url || 
             properties.url?.url || 
             properties.Url?.url || '',
        description: properties.Description?.rich_text?.[0]?.plain_text || 
                     properties.description?.rich_text?.[0]?.plain_text || '',
        status: properties.Status?.select?.name || 
                properties.status?.select?.name || 'Non démarré',
        createdAt: data.created_time,
        updatedAt: data.last_edited_time,
        progress: properties.Progress?.number || 
                  properties.progress?.number || 0,
        itemsCount: properties.ItemsCount?.number || 
                    properties.itemsCount?.number ||
                    properties.Nombre?.number || 15
      };
      
      // Sauvegarder dans le cache
      cacheService.set(`${PROJECT_CACHE_PREFIX}${cleanId}`, project, PROJECT_CACHE_TTL);
      
      return project;
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${cleanId}:`, error);
      
      // Ne pas propager l'erreur, retourner null
      return null;
    }
  },
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: { name: string; url: string; description?: string }): Promise<Project | null> {
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
        "Name": { title: [{ text: { content: data.name } }] },
        "URL": { url: data.url },
        "Progress": { number: 0 },
        "ItemsCount": { number: 15 }
      };
      
      // Ajouter la description si fournie
      if (data.description) {
        properties["Description"] = { 
          rich_text: [{ text: { content: data.description } }] 
        };
      }
      
      const response = await notionClient.post<NotionAPIPage>('/pages', {
        parent: { database_id: dbId },
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la création du projet');
      }
      
      // Récupérer le projet créé pour avoir toutes les propriétés
      const newProject = await this.getProject(response.data.id, true);
      
      // Invalider le cache des projets pour forcer un rechargement
      cacheService.remove(PROJECTS_CACHE_KEY);
      
      return newProject;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Préparer les propriétés pour la mise à jour
      const properties: any = {};
      
      if (data.name) {
        properties["Name"] = { title: [{ text: { content: data.name } }] };
      }
      
      if (data.url) {
        properties["URL"] = { url: data.url };
      }
      
      if (data.description !== undefined) {
        properties["Description"] = { 
          rich_text: data.description ? [{ text: { content: data.description } }] : [] 
        };
      }
      
      if (data.status !== undefined) {
        properties["Status"] = { 
          select: data.status ? { name: data.status } : null 
        };
      }
      
      if (data.progress !== undefined) {
        properties["Progress"] = { number: data.progress };
      }
      
      if (data.itemsCount !== undefined) {
        properties["ItemsCount"] = { number: data.itemsCount };
      }
      
      const response = await notionClient.patch(`/pages/${id}`, {
        properties
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la mise à jour du projet');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${PROJECT_CACHE_PREFIX}${id}`);
      cacheService.remove(PROJECTS_CACHE_KEY);
      
      // Récupérer le projet mis à jour
      return await this.getProject(id, true);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime un projet (archive dans Notion)
   */
  async deleteProject(id: string): Promise<boolean> {
    if (!notionClient.isConfigured()) {
      throw new Error('Client Notion non configuré');
    }
    
    try {
      // Dans Notion, on ne peut pas vraiment supprimer, on archive
      const response = await notionClient.patch(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Échec de la suppression du projet');
      }
      
      // Invalider les caches concernés
      cacheService.remove(`${PROJECT_CACHE_PREFIX}${id}`);
      cacheService.remove(PROJECTS_CACHE_KEY);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      throw error;
    }
  }
};

// Pour la compatibilité avec le code existant
export type NotionProject = Project;
