/**
 * Implémentations API pour le service de projets
 * 
 * Ce fichier contient les implémentations spécifiques à l'API Notion
 * pour les opérations CRUD sur les projets.
 */

import { notionClient } from '../client/notionClient';
import { Project } from '@/types/domain';
import { extractTextProperty, notionPageToProject } from './utils';
import { NotionResponse } from '../types';
import { CreateProjectInput, UpdateProjectInput } from './types';

/**
 * Récupère tous les projets depuis Notion
 */
export async function getAllProjects(): Promise<NotionResponse<Project[]>> {
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
    const projects: Project[] = response.data.results.map(notionPageToProject);
    
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
 * Récupère un projet par son ID depuis Notion
 */
export async function getProjectById(id: string): Promise<NotionResponse<Project>> {
  try {
    const response = await notionClient.get<any>(`/pages/${id}`);
    
    if (!response.success || !response.data) {
      return response as NotionResponse<Project>;
    }
    
    const project = notionPageToProject(response.data);
    
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
 * Crée un nouveau projet dans Notion
 */
export async function createProject(data: CreateProjectInput): Promise<NotionResponse<Project>> {
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
 * Met à jour un projet existant dans Notion
 */
export async function updateProject(project: UpdateProjectInput): Promise<NotionResponse<Project>> {
  try {
    // Préparer les propriétés à mettre à jour
    const properties: any = {};
    
    if (project.name !== undefined) {
      properties.Name = {
        title: [
          {
            text: {
              content: project.name
            }
          }
        ]
      };
    }
    
    if (project.url !== undefined) {
      properties.URL = {
        rich_text: [
          {
            text: {
              content: project.url
            }
          }
        ]
      };
    }
    
    if (project.description !== undefined) {
      properties.Description = {
        rich_text: [
          {
            text: {
              content: project.description
            }
          }
        ]
      };
    }
    
    // Mettre à jour la page dans Notion
    const response = await notionClient.patch<any>(`/pages/${project.id}`, {
      properties
    });
    
    if (!response.success || !response.data) {
      return response as NotionResponse<Project>;
    }
    
    const updatedPage = response.data;
    const project = notionPageToProject(updatedPage);
    
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
 * Supprime un projet de Notion
 */
export async function deleteProject(id: string): Promise<NotionResponse<boolean>> {
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
