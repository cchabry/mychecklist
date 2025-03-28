
/**
 * Implémentations réelles des opérations de projet pour l'API Notion
 */

import { Project } from '@/types/domain';
import { notionClient } from '../client';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { NotionResponse } from '../types';
import { extractNumberProperty, extractTextProperty, mapNotionPageToProject } from './utils';

/**
 * Création d'un projet dans Notion
 */
export async function createProjectNotionImplementation(
  data: CreateProjectInput
): Promise<NotionResponse<Project>> {
  const dbId = notionClient.getConfig()?.projectsDbId;
  
  if (!dbId) {
    return {
      success: false,
      error: {
        message: "ID de base de données des projets non configuré"
      }
    };
  }
  
  try {
    let createdProject: Project;
    
    const response = await notionClient.post('/pages', {
      parent: { database_id: dbId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: data.name
              }
            }
          ]
        },
        URL: data.url ? {
          url: data.url
        } : null,
        Description: data.description ? {
          rich_text: [
            {
              text: {
                content: data.description
              }
            }
          ]
        } : null,
        Progress: {
          number: data.progress || 0
        }
      }
    });
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: response.error?.message || "Erreur lors de la création du projet"
        }
      };
    }
    
    createdProject = mapNotionPageToProject(response.data);
    
    return {
      success: true,
      data: createdProject
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Erreur lors de la création du projet: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}

/**
 * Mise à jour d'un projet dans Notion
 */
export async function updateProjectNotionImplementation(
  entity: UpdateProjectInput
): Promise<NotionResponse<Project>> {
  if (!entity.id) {
    return {
      success: false,
      error: {
        message: "ID du projet non fourni pour la mise à jour"
      }
    };
  }
  
  try {
    const properties: Record<string, any> = {};
    
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
      properties.URL = entity.url ? {
        url: entity.url
      } : null;
    }
    
    if (entity.description !== undefined) {
      properties.Description = entity.description ? {
        rich_text: [
          {
            text: {
              content: entity.description
            }
          }
        ]
      } : null;
    }
    
    if (entity.progress !== undefined) {
      properties.Progress = {
        number: entity.progress
      };
    }
    
    const response = await notionClient.patch(`/pages/${entity.id}`, {
      properties
    });
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: response.error?.message || "Erreur lors de la mise à jour du projet"
        }
      };
    }
    
    const updatedProject = mapNotionPageToProject(response.data);
    
    return {
      success: true,
      data: updatedProject
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Erreur lors de la mise à jour du projet: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}

/**
 * Récupération de tous les projets depuis Notion
 */
export async function getAllProjectsNotionImplementation(): Promise<NotionResponse<Project[]>> {
  const dbId = notionClient.getConfig()?.projectsDbId;
  
  if (!dbId) {
    return {
      success: false,
      error: {
        message: "ID de base de données des projets non configuré"
      }
    };
  }
  
  try {
    const response = await notionClient.get(`/databases/${dbId}/query`);
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: response.error?.message || "Erreur lors de la récupération des projets"
        }
      };
    }
    
    const results = response.data.results || [];
    const projects = results.map(mapNotionPageToProject);
    
    return {
      success: true,
      data: projects
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Erreur lors de la récupération des projets: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}

/**
 * Récupération d'un projet par son ID depuis Notion
 */
export async function getProjectByIdNotionImplementation(id: string): Promise<NotionResponse<Project>> {
  try {
    const response = await notionClient.get(`/pages/${id}`);
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: response.error?.message || "Erreur lors de la récupération du projet"
        }
      };
    }
    
    const project = mapNotionPageToProject(response.data);
    
    return {
      success: true,
      data: project
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Erreur lors de la récupération du projet: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}

/**
 * Suppression d'un projet dans Notion
 */
export async function deleteProjectNotionImplementation(id: string): Promise<NotionResponse<boolean>> {
  try {
    const response = await notionClient.delete(`/pages/${id}`);
    
    if (!response.success) {
      return {
        success: false,
        error: {
          message: response.error?.message || "Erreur lors de la suppression du projet"
        }
      };
    }
    
    return {
      success: true,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Erreur lors de la suppression du projet: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}
