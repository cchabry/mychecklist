
/**
 * Implémentation standardisée du service de projets
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService, generateMockId } from '../base/BaseNotionService';
import { NotionResponse } from '../types';
import { Project } from '@/types/domain';
import { notionClient } from '../notionClient';

/**
 * Type pour la création d'un projet
 */
export interface CreateProjectInput extends Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
  progress?: number;
}

/**
 * Type pour la mise à jour d'un projet
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  url?: string;
  description?: string;
  progress?: number;
}

/**
 * Implémentation standardisée du service de projets
 */
export class ProjectServiceImpl extends BaseNotionService<Project, CreateProjectInput, UpdateProjectInput> {
  constructor() {
    super('Projet', 'projectsDbId');
  }
  
  /**
   * Génère des projets fictifs pour le mode mock
   */
  protected async getMockEntities(): Promise<Project[]> {
    const now = new Date().toISOString();
    return [
      { 
        id: '1', 
        name: 'Projet 1', 
        url: 'https://example.com/projet1', 
        description: 'Description du projet 1',
        createdAt: now, 
        updatedAt: now,
        progress: 75 
      },
      { 
        id: '2', 
        name: 'Projet 2', 
        url: 'https://example.com/projet2', 
        description: 'Description du projet 2',
        createdAt: now, 
        updatedAt: now,
        progress: 30
      },
      { 
        id: '3', 
        name: 'Projet 3', 
        url: 'https://example.com/projet3', 
        description: 'Description du projet 3',
        createdAt: now, 
        updatedAt: now,
        progress: 0
      }
    ];
  }
  
  /**
   * Crée un projet fictif en mode mock
   */
  protected async mockCreate(data: CreateProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    return {
      ...data,
      id: generateMockId('proj'),
      createdAt: now,
      updatedAt: now,
      progress: data.progress || 0
    };
  }
  
  /**
   * Met à jour un projet fictif en mode mock
   */
  protected async mockUpdate(entity: UpdateProjectInput): Promise<Project> {
    // Récupérer le projet existant
    const mockProjects = await this.getMockEntities();
    const existingProject = mockProjects.find(p => p.id === entity.id);
    
    if (!existingProject) {
      throw new Error(`Projet #${entity.id} non trouvé`);
    }
    
    return {
      ...existingProject,
      name: entity.name !== undefined ? entity.name : existingProject.name,
      url: entity.url !== undefined ? entity.url : existingProject.url,
      description: entity.description !== undefined ? entity.description : existingProject.description,
      progress: entity.progress !== undefined ? entity.progress : existingProject.progress,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Implémentation de la récupération des projets
   */
  protected async getAllImpl(): Promise<NotionResponse<Project[]>> {
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return { success: false, error: { message: "Base de données des projets non configurée" } };
    }
    
    try {
      // Interroger la base de données Notion
      const response = await notionClient.post<{results: any[]}>(`/databases/${config.projectsDbId}/query`, {});
      
      if (!response.success || !response.data?.results) {
        return { success: false, error: response.error };
      }
      
      // Transformer les résultats Notion en projets
      const projects: Project[] = response.data.results.map(page => {
        const properties = page.properties;
        
        return {
          id: page.id,
          name: this.extractTextProperty(properties.Name),
          url: this.extractTextProperty(properties.URL),
          description: this.extractTextProperty(properties.Description) || '',
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
          progress: properties.Progress?.number || 0
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
          message: `Erreur lors de la récupération des projets: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la récupération d'un projet par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Project>> {
    try {
      const response = await notionClient.get<any>(`/pages/${id}`);
      
      if (!response.success || !response.data) {
        return response as NotionResponse<Project>;
      }
      
      const page = response.data;
      const properties = page.properties;
      
      const project: Project = {
        id: page.id,
        name: this.extractTextProperty(properties.Name),
        url: this.extractTextProperty(properties.URL),
        description: this.extractTextProperty(properties.Description) || '',
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
        progress: properties.Progress?.number || 0
      };
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'un projet
   */
  protected async createImpl(data: CreateProjectInput): Promise<NotionResponse<Project>> {
    const config = notionClient.getConfig();
    if (!config.projectsDbId) {
      return { success: false, error: { message: "Base de données des projets non configurée" } };
    }
    
    try {
      // Préparer les propriétés pour Notion
      const properties: any = {
        Name: {
          title: [
            {
              text: {
                content: data.name
              }
            }
          ]
        }
      };
      
      if (data.url) {
        properties.URL = {
          rich_text: [
            {
              text: {
                content: data.url
              }
            }
          ]
        };
      }
      
      if (data.description) {
        properties.Description = {
          rich_text: [
            {
              text: {
                content: data.description
              }
            }
          ]
        };
      }
      
      // Créer la page dans Notion
      const response = await notionClient.post<any>('/pages', {
        parent: { database_id: config.projectsDbId },
        properties
      });
      
      if (!response.success || !response.data) {
        return response as NotionResponse<Project>;
      }
      
      const newPage = response.data;
      
      // Transformer la réponse en projet
      const project: Project = {
        id: newPage.id,
        name: data.name,
        url: data.url || '',
        description: data.description || '',
        createdAt: newPage.created_time,
        updatedAt: newPage.last_edited_time,
        progress: 0
      };
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'un projet
   */
  protected async updateImpl(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
    try {
      // Préparer les propriétés à mettre à jour
      const properties: any = {};
      
      if (entity.name !== undefined) {
        properties.Name = {
          title: [
            {
              text: {
                content: entity.name
              }
            }
          ]
        };
      }
      
      if (entity.url !== undefined) {
        properties.URL = {
          rich_text: [
            {
              text: {
                content: entity.url
              }
            }
          ]
        };
      }
      
      if (entity.description !== undefined) {
        properties.Description = {
          rich_text: [
            {
              text: {
                content: entity.description
              }
            }
          ]
        };
      }
      
      // Mettre à jour la page dans Notion
      const response = await notionClient.patch<any>(`/pages/${entity.id}`, {
        properties
      });
      
      if (!response.success || !response.data) {
        return response as NotionResponse<Project>;
      }
      
      const updatedPage = response.data;
      const updatedProperties = updatedPage.properties;
      
      // Transformer la réponse en projet mis à jour
      const project: Project = {
        id: updatedPage.id,
        name: this.extractTextProperty(updatedProperties.Name),
        url: this.extractTextProperty(updatedProperties.URL),
        description: this.extractTextProperty(updatedProperties.Description) || '',
        createdAt: updatedPage.created_time,
        updatedAt: updatedPage.last_edited_time,
        progress: updatedProperties.Progress?.number || 0
      };
      
      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'un projet
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    try {
      // Dans Notion, on "archive" une page plutôt que de la supprimer
      const response = await notionClient.patch<any>(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        return response as NotionResponse<boolean>;
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du projet: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Utilitaire pour extraire le texte d'une propriété Notion
   */
  private extractTextProperty(property: any): string {
    if (!property) return '';
    
    if (property.title && Array.isArray(property.title)) {
      return property.title.map((t: any) => t.plain_text || '').join('');
    }
    
    if (property.rich_text && Array.isArray(property.rich_text)) {
      return property.rich_text.map((t: any) => t.plain_text || '').join('');
    }
    
    return '';
  }
}

// Créer et exporter une instance singleton
export const projectServiceImpl = new ProjectServiceImpl();

// Export par défaut
export default projectServiceImpl;
