/**
 * Implémentations des API pour les projets (mode réel)
 */

import { Project } from '@/types/domain';
import { NotionQueryResponse, NotionPageObjectResponse } from '@/types/api/notionApi';
import { notionClient } from '../client/notionClient';
import { generateId } from '@/utils';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus } from '@/types/enums';

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

  const titleValue = titleProperty?.type === 'title' ? titleProperty.title.map(t => t.plain_text).join('') : '';
  const urlValue = urlProperty?.type === 'url' ? urlProperty.url : '';
  const descriptionValue = descriptionProperty?.type === 'rich_text' ? descriptionProperty.rich_text.map(t => t.plain_text).join('') : '';
  const statusValue = statusProperty?.type === 'select' ? statusProperty.select?.name : ProjectStatus.InProgress;
  const progressValue = progressProperty?.type === 'number' ? progressProperty.number : 0;
  const lastAuditDateValue = lastAuditDateProperty?.type === 'date' && lastAuditDateProperty.date ? lastAuditDateProperty.date.start : undefined;
  
  return {
    id: page.id,
    name: titleValue,
    url: urlValue,
    description: descriptionValue,
    status: statusValue as ProjectStatus, // Cast explicite vers ProjectStatus
    progress: progressValue,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    lastAuditDate: lastAuditDateValue
  };
};

/**
 * Implémentation de l'API pour récupérer tous les projets
 */
export const apiGetProjects = async (): Promise<Project[]> => {
  const config = notionClient.getConfig();
  if (!config?.projectsDbId) {
    throw new Error("ID de base de données des projets non configuré");
  }
  
  try {
    const response = await notionClient.request<NotionQueryResponse>({
      method: 'POST',
      path: `databases/${config.projectsDbId}/query`,
      body: {}
    });
    
    if (!response.results) {
      console.warn("Aucun résultat trouvé lors de la récupération des projets.");
      return [];
    }
    
    // Convertir les résultats en objets Project
    const projects: Project[] = response.results.map(page => notionPageToProject(page as NotionPageObjectResponse));
    return projects;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    throw error;
  }
};

/**
 * Implémentation de l'API pour récupérer un projet par son ID
 */
export const apiGetProjectById = async (id: string): Promise<Project | null> => {
  try {
    const response = await notionClient.request<NotionPageObjectResponse>({
      method: 'GET',
      path: `pages/${id}`
    });
    
    // Convertir la réponse en objet Project
    const project: Project = notionPageToProject(response);
    return project;
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet avec l'ID ${id}:`, error);
    return null;
  }
};

/**
 * Implémentation de l'API pour créer un nouveau projet
 */
export const apiCreateProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const config = notionClient.getConfig();
  if (!config?.projectsDbId) {
    throw new Error("ID de base de données des projets non configuré");
  }

  const now = new Date().toISOString();
  const newId = generateId();
  
  try {
    const response = await notionClient.request({
      method: 'POST',
      path: 'pages',
      body: {
        parent: { database_id: config.projectsDbId },
        properties: {
          Name: {
            title: [
              {
                type: 'text',
                text: { content: project.name || 'Nouveau projet' }
              }
            ]
          },
          URL: {
            url: project.url || null
          },
          Description: {
            rich_text: [
              {
                type: 'text',
                text: { content: project.description || '' }
              }
            ]
          },
          Status: {
            select: {
              name: project.status || ProjectStatus.InProgress
            }
          },
          Progress: {
            number: project.progress || 0
          },
          'Last Audit Date': {
            date: project.lastAuditDate ? { start: project.lastAuditDate } : null
          }
        }
      }
    });

    // Convertir la réponse en objet Project
    const createdProject: Project = {
      id: response.id,
      name: project.name || 'Nouveau projet',
      url: project.url,
      description: project.description,
      status: project.status || ProjectStatus.InProgress,
      progress: project.progress || 0,
      createdAt: response.created_time || now,
      updatedAt: response.last_edited_time || now,
      lastAuditDate: project.lastAuditDate
    };

    return createdProject;
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    throw error;
  }
};

/**
 * Implémentation de l'API pour mettre à jour un projet existant
 */
export const apiUpdateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  try {
    const existingProject = await apiGetProjectById(id);
    if (!existingProject) {
      throw new Error(`Projet avec l'ID ${id} non trouvé`);
    }
    
    const config = notionClient.getConfig();
    if (!config?.projectsDbId) {
      throw new Error("ID de base de données des projets non configuré");
    }
    
    const updatedTime = new Date().toISOString();
    
    const properties: any = {};
    
    if (project.name !== undefined) {
      properties.Name = {
        title: [
          {
            type: 'text',
            text: { content: project.name }
          }
        ]
      };
    }
    
    if (project.url !== undefined) {
      properties.URL = {
        url: project.url
      };
    }
    
    if (project.description !== undefined) {
      properties.Description = {
        rich_text: [
          {
            type: 'text',
            text: { content: project.description }
          }
        ]
      };
    }
    
    if (project.status !== undefined) {
      properties.Status = {
        select: {
          name: project.status
        }
      };
    }
    
    if (project.progress !== undefined) {
      properties.Progress = {
        number: project.progress
      };
    }
    
    if (project.lastAuditDate !== undefined) {
      properties['Last Audit Date'] = {
        date: project.lastAuditDate ? { start: project.lastAuditDate } : null
      };
    }
    
    const response = await notionClient.request({
      method: 'PATCH',
      path: `pages/${id}`,
      body: {
        properties,
        last_edited_time: updatedTime
      }
    });
    
    // Convertir la réponse en objet Project
    const updatedProject: Project = {
      ...existingProject,
      ...project,
      updatedAt: updatedTime
    };
    
    return updatedProject;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du projet avec l'ID ${id}:`, error);
    throw error;
  }
};

/**
 * Implémentation de l'API pour supprimer un projet
 */
export const apiDeleteProject = async (id: string): Promise<boolean> => {
  try {
    await notionClient.request({
      method: 'PATCH',
      path: `pages/${id}`,
      body: {
        archived: true
      }
    });
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet avec l'ID ${id}:`, error);
    return false;
  }
};
