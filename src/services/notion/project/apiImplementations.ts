
/**
 * Implémentations des API pour les projets
 */

import { Project } from '@/types/domain';
import { notionClient } from '../client/notionClient';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus } from '@/types/enums';
import { NotionResponse } from '../types';
import { CreateProjectInput, UpdateProjectInput } from './types';

// Interface pour la réponse de requête Notion
interface NotionQueryResponse {
  results: any[];
  next_cursor?: string;
  has_more?: boolean;
}

// Interface pour la réponse de page Notion
interface NotionPageObjectResponse {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
}

/**
 * Convertit un objet page Notion en objet projet
 */
const notionPageToProject = (page: NotionPageObjectResponse): Project => {
  const titleProperty = page.properties['Name'];
  const urlProperty = page.properties['URL'];
  const descriptionProperty = page.properties['Description'];
  const statusProperty = page.properties['Status'];
  const progressProperty = page.properties['Progress'];
  const lastAuditDateProperty = page.properties['Last Audit Date'];

  const titleValue = titleProperty?.type === 'title' ? titleProperty.title.map((t: any) => t.plain_text).join('') : '';
  const urlValue = urlProperty?.type === 'url' ? urlProperty.url : '';
  const descriptionValue = descriptionProperty?.type === 'rich_text' ? descriptionProperty.rich_text.map((t: any) => t.plain_text).join('') : '';
  const statusValue = statusProperty?.type === 'select' ? statusProperty.select?.name : ProjectStatus.InProgress;
  const progressValue = progressProperty?.type === 'number' ? progressProperty.number : 0;
  const lastAuditDateValue = lastAuditDateProperty?.type === 'date' && lastAuditDateProperty.date ? lastAuditDateProperty.date.start : undefined;
  
  return {
    id: page.id,
    name: titleValue,
    url: urlValue,
    description: descriptionValue,
    status: statusValue as ProjectStatus,
    progress: progressValue,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    lastAuditDate: lastAuditDateValue
  };
};

/**
 * Implémentation pour récupérer tous les projets
 */
export async function getAllProjectsNotionImplementation(): Promise<NotionResponse<Project[]>> {
  const config = notionClient.getConfig();
  if (!config?.projectsDbId) {
    return { 
      success: false, 
      error: { message: "ID de base de données des projets non configuré" } 
    };
  }
  
  try {
    const response = await notionClient.post(`databases/${config.projectsDbId}/query`, {});
    
    if (!response.success) {
      return response as NotionResponse<Project[]>;
    }
    
    const responseData = response.data as NotionQueryResponse;
    const projects = (responseData?.results || []).map(page => notionPageToProject(page as NotionPageObjectResponse));
    
    return {
      success: true,
      data: projects
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return {
      success: false,
      error: { 
        message: `Erreur lors de la récupération des projets: ${error instanceof Error ? error.message : String(error)}` 
      }
    };
  }
}

/**
 * Implémentation pour récupérer un projet par son ID
 */
export async function getProjectByIdNotionImplementation(id: string): Promise<NotionResponse<Project>> {
  try {
    const response = await notionClient.get(`pages/${id}`);
    
    if (!response.success) {
      return response as NotionResponse<Project>;
    }
    
    const page = response.data as NotionPageObjectResponse;
    const project = notionPageToProject(page);
    
    return {
      success: true,
      data: project
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet avec l'ID ${id}:`, error);
    return {
      success: false,
      error: { 
        message: `Erreur lors de la récupération du projet: ${error instanceof Error ? error.message : String(error)}` 
      }
    };
  }
}

/**
 * Implémentation pour créer un nouveau projet
 */
export async function createProjectNotionImplementation(data: CreateProjectInput): Promise<NotionResponse<Project>> {
  const config = notionClient.getConfig();
  if (!config?.projectsDbId) {
    return { 
      success: false, 
      error: { message: "ID de base de données des projets non configuré" } 
    };
  }

  const now = new Date().toISOString();
  
  try {
    const response = await notionClient.post('pages', {
      parent: { database_id: config.projectsDbId },
      properties: {
        Name: {
          title: [
            {
              type: 'text',
              text: { content: data.name || 'Nouveau projet' }
            }
          ]
        },
        URL: {
          url: data.url || null
        },
        Description: {
          rich_text: [
            {
              type: 'text',
              text: { content: data.description || '' }
            }
          ]
        },
        Status: {
          select: {
            name: data.status || ProjectStatus.InProgress
          }
        },
        Progress: {
          number: data.progress || 0
        },
        'Last Audit Date': {
          date: null
        }
      }
    });

    if (!response.success) {
      return response as NotionResponse<Project>;
    }
    
    const page = response.data as NotionPageObjectResponse;
    
    // Convertir la réponse en objet Project
    const createdProject: Project = {
      id: page.id,
      name: data.name || 'Nouveau projet',
      url: data.url,
      description: data.description,
      status: data.status || ProjectStatus.InProgress,
      progress: data.progress || 0,
      createdAt: page.created_time || now,
      updatedAt: page.last_edited_time || now
    };

    return {
      success: true,
      data: createdProject
    };
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    return {
      success: false,
      error: { 
        message: `Erreur lors de la création du projet: ${error instanceof Error ? error.message : String(error)}` 
      }
    };
  }
}

/**
 * Implémentation pour mettre à jour un projet existant
 */
export async function updateProjectNotionImplementation(data: UpdateProjectInput): Promise<NotionResponse<Project>> {
  try {
    // Récupérer le projet existant
    const existingProjectResponse = await getProjectByIdNotionImplementation(data.id);
    
    if (!existingProjectResponse.success || !existingProjectResponse.data) {
      return {
        success: false,
        error: { message: `Projet avec l'ID ${data.id} non trouvé` }
      };
    }
    
    const existingProject = existingProjectResponse.data;
    
    // Préparer les propriétés à mettre à jour
    const properties: Record<string, any> = {};
    
    if (data.name !== undefined) {
      properties.Name = {
        title: [
          {
            type: 'text',
            text: { content: data.name }
          }
        ]
      };
    }
    
    if (data.url !== undefined) {
      properties.URL = {
        url: data.url
      };
    }
    
    if (data.description !== undefined) {
      properties.Description = {
        rich_text: [
          {
            type: 'text',
            text: { content: data.description }
          }
        ]
      };
    }
    
    if (data.status !== undefined) {
      properties.Status = {
        select: {
          name: data.status
        }
      };
    }
    
    if (data.progress !== undefined) {
      properties.Progress = {
        number: data.progress
      };
    }
    
    // Mise à jour via l'API Notion
    await notionClient.patch(`pages/${data.id}`, {
      properties
    });
    
    // Fusionner les données existantes avec les mises à jour
    const updatedProject: Project = {
      ...existingProject,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedProject
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du projet avec l'ID ${data.id}:`, error);
    return {
      success: false,
      error: { 
        message: `Erreur lors de la mise à jour du projet: ${error instanceof Error ? error.message : String(error)}` 
      }
    };
  }
}

/**
 * Implémentation pour supprimer un projet
 */
export async function deleteProjectNotionImplementation(id: string): Promise<NotionResponse<boolean>> {
  try {
    const response = await notionClient.patch(`pages/${id}`, {
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
    console.error(`Erreur lors de la suppression du projet avec l'ID ${id}:`, error);
    return {
      success: false,
      error: { 
        message: `Erreur lors de la suppression du projet: ${error instanceof Error ? error.message : String(error)}` 
      }
    };
  }
}

/**
 * Génère des projets fictifs pour le mode mock
 */
export function mockGetProjects(): Project[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'mock-project-1',
      name: 'Site Web Corporate',
      url: 'https://example.com',
      description: 'Site vitrine de l\'entreprise',
      status: ProjectStatus.InProgress,
      progress: 75,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'mock-project-2',
      name: 'Plateforme E-commerce',
      url: 'https://shop.example.com',
      description: 'Boutique en ligne multivendeur',
      status: ProjectStatus.Planning,
      progress: 30,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'mock-project-3',
      name: 'Application Mobile',
      description: 'Application mobile cross-platform',
      status: ProjectStatus.Completed,
      progress: 100,
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Crée un projet fictif en mode mock
 */
export function mockCreateProject(data: CreateProjectInput): Project {
  const now = new Date().toISOString();
  
  return {
    id: `mock-project-${uuidv4().substring(0, 8)}`,
    name: data.name,
    url: data.url,
    description: data.description,
    status: data.status || ProjectStatus.Planning,
    progress: data.progress || 0,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Met à jour un projet fictif en mode mock
 */
export function mockUpdateProject(data: UpdateProjectInput): Project {
  // Dans un scénario réel, nous récupérerions les données existantes
  // Pour cette simulation, nous créons un objet avec des valeurs par défaut
  
  return {
    id: data.id,
    name: data.name || 'Projet mis à jour',
    url: data.url || 'https://example.com/updated',
    description: data.description || 'Description mise à jour',
    status: data.status || ProjectStatus.InProgress,
    progress: data.progress !== undefined ? data.progress : 50,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 jour dans le passé
    updatedAt: new Date().toISOString()
  };
}

/**
 * Simule la suppression d'un projet en mode mock
 */
export function mockDeleteProject(id: string): boolean {
  console.log(`Simulation de suppression du projet ${id} en mode mock`);
  return true;
}
