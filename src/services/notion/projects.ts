
import { notionClient, NotionAPIResponse } from './client';
import { Project } from '@/lib/types';

/**
 * Interface pour les projets tels que stockés dans Notion
 */
export interface NotionProject {
  id: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount: number;
}

/**
 * Service pour la gestion des projets via l'API Notion
 */
export class ProjectsService {
  /**
   * Récupère tous les projets de la base Notion
   */
  public async getProjects(): Promise<NotionAPIResponse<Project[]>> {
    try {
      // Vérifier si le client est configuré
      if (!notionClient.isConfigured()) {
        return {
          success: false,
          error: {
            message: 'Client Notion non configuré',
            code: 'not_configured'
          }
        };
      }
      
      // Effectuer la requête à la base de données
      const dbId = localStorage.getItem('notion_database_id');
      const response = await notionClient.post<any>(`/databases/${dbId}/query`, {});
      
      if (!response.success) {
        return response;
      }
      
      // Convertir les résultats en projets
      const projects: Project[] = response.data.results.map((page: any) => {
        const properties = page.properties;
        
        // Extraire les propriétés avec différentes variations possibles de casse
        const name = this.getPropertyValue(properties, ['Name', 'name', 'Nom', 'nom', 'Titre', 'titre'], 'title');
        const url = this.getPropertyValue(properties, ['URL', 'Url', 'url'], 'url');
        const description = this.getPropertyValue(properties, ['Description', 'description'], 'rich_text');
        const status = this.getPropertyValue(properties, ['Status', 'status', 'Statut', 'statut'], 'select');
        const progress = this.getPropertyValue(properties, ['Progress', 'progress', 'Progression', 'progression'], 'number');
        const itemsCount = this.getPropertyValue(properties, ['ItemsCount', 'itemsCount', 'Nombre', 'nombre'], 'number');
        
        return {
          id: page.id,
          name: name || 'Sans titre',
          url: url || '#',
          description: description || '',
          status: status || 'Non démarré',
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
          progress: progress !== undefined ? progress : 0,
          itemsCount: itemsCount !== undefined ? itemsCount : 15,
          pagesCount: 0 // Sera calculé séparément
        };
      });
      
      return {
        success: true,
        data: projects
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération des projets',
          details: error
        }
      };
    }
  }
  
  /**
   * Récupère un projet par son identifiant
   */
  public async getProjectById(id: string): Promise<NotionAPIResponse<Project>> {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            message: 'ID de projet non spécifié',
            code: 'missing_id'
          }
        };
      }
      
      // Tenter de récupérer la page du projet
      const response = await notionClient.get<any>(`/pages/${id}`);
      
      if (!response.success) {
        return response;
      }
      
      // Convertir la page en projet
      const page = response.data;
      const properties = page.properties;
      
      // Extraire les propriétés avec différentes variations possibles de casse
      const name = this.getPropertyValue(properties, ['Name', 'name', 'Nom', 'nom', 'Titre', 'titre'], 'title');
      const url = this.getPropertyValue(properties, ['URL', 'Url', 'url'], 'url');
      const description = this.getPropertyValue(properties, ['Description', 'description'], 'rich_text');
      const status = this.getPropertyValue(properties, ['Status', 'status', 'Statut', 'statut'], 'select');
      const progress = this.getPropertyValue(properties, ['Progress', 'progress', 'Progression', 'progression'], 'number');
      const itemsCount = this.getPropertyValue(properties, ['ItemsCount', 'itemsCount', 'Nombre', 'nombre'], 'number');
      
      const project: Project = {
        id: page.id,
        name: name || 'Sans titre',
        url: url || '#',
        description: description || '',
        status: status || 'Non démarré',
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
        progress: progress !== undefined ? progress : 0,
        itemsCount: itemsCount !== undefined ? itemsCount : 15,
        pagesCount: 0 // Sera calculé séparément
      };
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : `Erreur lors de la récupération du projet (ID: ${id})`,
          details: error
        }
      };
    }
  }
  
  /**
   * Crée un nouveau projet dans Notion
   */
  public async createProject(name: string, url: string, description: string = 'Nouveau projet'): Promise<NotionAPIResponse<Project>> {
    try {
      // Vérifier si le client est configuré
      if (!notionClient.isConfigured()) {
        return {
          success: false,
          error: {
            message: 'Client Notion non configuré',
            code: 'not_configured'
          }
        };
      }
      
      const dbId = localStorage.getItem('notion_database_id');
      
      // Préparer les propriétés du projet
      const properties: any = {
        "Name": { 
          title: [{ 
            text: { content: name } 
          }] 
        },
        "URL": { url: url },
        "Description": { 
          rich_text: [{ 
            text: { content: description } 
          }] 
        },
        "Status": { select: { name: 'Non démarré' } },
        "Progress": { number: 0 },
        "ItemsCount": { number: 15 }
      };
      
      // Créer la page dans Notion
      const response = await notionClient.post<any>('/pages', {
        parent: { database_id: dbId },
        properties
      });
      
      if (!response.success) {
        return response;
      }
      
      // Convertir la réponse en projet
      const newProject: Project = {
        id: response.data.id,
        name,
        url,
        description,
        status: 'Non démarré',
        createdAt: response.data.created_time,
        updatedAt: response.data.last_edited_time,
        progress: 0,
        itemsCount: 15,
        pagesCount: 0
      };
      
      return {
        success: true,
        data: newProject
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la création du projet',
          details: error
        }
      };
    }
  }
  
  /**
   * Met à jour un projet existant
   */
  public async updateProject(id: string, updates: Partial<Project>): Promise<NotionAPIResponse<Project>> {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            message: 'ID de projet non spécifié',
            code: 'missing_id'
          }
        };
      }
      
      // Préparer les propriétés à mettre à jour
      const properties: any = {};
      
      if (updates.name !== undefined) {
        properties.Name = {
          title: [{ text: { content: updates.name } }]
        };
      }
      
      if (updates.url !== undefined) {
        properties.URL = { url: updates.url };
      }
      
      if (updates.description !== undefined) {
        properties.Description = {
          rich_text: [{ text: { content: updates.description } }]
        };
      }
      
      if (updates.status !== undefined) {
        properties.Status = { select: { name: updates.status } };
      }
      
      if (updates.progress !== undefined) {
        properties.Progress = { number: updates.progress };
      }
      
      if (updates.itemsCount !== undefined) {
        properties.ItemsCount = { number: updates.itemsCount };
      }
      
      // Envoyer la mise à jour à Notion
      const response = await notionClient.patch<any>(`/pages/${id}`, {
        properties
      });
      
      if (!response.success) {
        return response;
      }
      
      // Récupérer le projet mis à jour
      return this.getProjectById(id);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : `Erreur lors de la mise à jour du projet (ID: ${id})`,
          details: error
        }
      };
    }
  }
  
  /**
   * Utilitaire pour extraire la valeur d'une propriété avec différentes clés possibles
   */
  private getPropertyValue(properties: any, keys: string[], type: string): any {
    for (const key of keys) {
      const property = properties[key];
      if (!property) continue;
      
      switch (type) {
        case 'title':
          if (property.title && Array.isArray(property.title) && property.title.length > 0) {
            return property.title.map((t: any) => t.plain_text).join('');
          }
          break;
        
        case 'rich_text':
          if (property.rich_text && Array.isArray(property.rich_text) && property.rich_text.length > 0) {
            return property.rich_text.map((rt: any) => rt.plain_text).join('');
          }
          break;
          
        case 'url':
          return property.url;
        
        case 'select':
          if (property.select) {
            return property.select.name;
          }
          break;
        
        case 'number':
          return property.number;
      }
    }
    
    return undefined;
  }
}

// Exporter une instance unique du service
export const projectsService = new ProjectsService();
