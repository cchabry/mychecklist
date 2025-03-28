
/**
 * Implémentations des API Notion pour les projets
 */

import { Project } from '@/types/domain';
import { notionClient } from '../notionClient';
import { NotionResponse } from '../types';
import { formatDate } from '@/utils/date';
import { defaultHeaders } from '../constants';

// Interface pour les données de création de projet
export interface CreateProjectData {
  name: string;
  url?: string;
  description?: string;
  progress?: number;
  status?: string;
}

// Interface pour les données de mise à jour de projet
export interface UpdateProjectData {
  name?: string;
  url?: string;
  description?: string;
  progress?: number;
  status?: string;
}

/**
 * Récupère tous les projets depuis la base de données Notion
 */
export async function getProjectsFromNotion(): Promise<NotionResponse<Project[]>> {
  try {
    // Vérifier que la configuration est disponible
    if (!notionClient.getConfig()) {
      return { success: false, error: { message: 'Configuration Notion non disponible' } };
    }

    // Utiliser le mode mock si activé
    if (notionClient.isMockMode()) {
      return { success: true, data: getMockProjects() };
    }

    // Récupérer la base de données des projets
    const databaseId = notionClient.getConfig()?.projectsDbId;
    if (!databaseId) {
      return { success: false, error: { message: 'ID de base de données des projets non configuré' } };
    }

    // Requête à l'API Notion
    const response = await notionClient.query({
      path: `/databases/${databaseId}/query`,
      method: 'POST',
      headers: defaultHeaders,
      body: {}
    });

    if (!response.success) {
      return response;
    }

    // Convertir les résultats en projets
    const projects = notionResultsToProjects(response.data.results);
    
    return { success: true, data: projects };
  } catch (error) {
    return { 
      success: false, 
      error: { message: 'Erreur lors de la récupération des projets', details: error } 
    };
  }
}

/**
 * Récupère un projet par son ID depuis Notion
 */
export async function getProjectByIdFromNotion(id: string): Promise<NotionResponse<Project>> {
  try {
    // Vérifier que la configuration est disponible
    if (!notionClient.getConfig()) {
      return { success: false, error: { message: 'Configuration Notion non disponible' } };
    }

    // Utiliser le mode mock si activé
    if (notionClient.isMockMode()) {
      const project = getMockProjectById(id);
      if (!project) {
        return { success: false, error: { message: `Projet non trouvé: ${id}` } };
      }
      return { success: true, data: project };
    }

    // Récupérer le projet depuis Notion
    const response = await notionClient.query({
      path: `/pages/${id}`,
      method: 'GET',
      headers: defaultHeaders
    });

    if (!response.success) {
      return response;
    }

    // Convertir le résultat en projet
    const project = notionPageToProject(response.data);
    
    return { success: true, data: project };
  } catch (error) {
    return { 
      success: false, 
      error: { message: `Erreur lors de la récupération du projet ${id}`, details: error } 
    };
  }
}

/**
 * Crée un nouveau projet dans Notion
 */
export async function createProjectInNotion(data: CreateProjectData): Promise<NotionResponse<Project>> {
  try {
    // Vérifier que la configuration est disponible
    if (!notionClient.getConfig()) {
      return { success: false, error: { message: 'Configuration Notion non disponible' } };
    }

    // Utiliser le mode mock si activé
    if (notionClient.isMockMode()) {
      const project = createMockProject(data);
      return { success: true, data: project };
    }

    // Récupérer la base de données des projets
    const databaseId = notionClient.getConfig()?.projectsDbId;
    if (!databaseId) {
      return { success: false, error: { message: 'ID de base de données des projets non configuré' } };
    }

    // Préparer les propriétés pour Notion
    const properties = {
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
      Progress: data.progress !== undefined ? {
        number: data.progress
      } : null,
      Status: data.status ? {
        select: {
          name: data.status
        }
      } : null,
    };

    // Supprimer les propriétés nulles
    Object.keys(properties).forEach(key => {
      if (properties[key] === null) {
        delete properties[key];
      }
    });

    // Créer le projet dans Notion
    const response = await notionClient.query({
      path: `/pages`,
      method: 'POST',
      headers: defaultHeaders,
      body: {
        parent: { database_id: databaseId },
        properties
      }
    });

    if (!response.success) {
      return response;
    }

    // Convertir le résultat en projet
    const project = notionPageToProject(response.data);
    
    return { success: true, data: project };
  } catch (error) {
    return { 
      success: false, 
      error: { message: 'Erreur lors de la création du projet', details: error } 
    };
  }
}

/**
 * Met à jour un projet existant dans Notion
 */
export async function updateProjectInNotion(id: string, data: UpdateProjectData): Promise<NotionResponse<Project>> {
  try {
    // Vérifier que la configuration est disponible
    if (!notionClient.getConfig()) {
      return { success: false, error: { message: 'Configuration Notion non disponible' } };
    }

    // Utiliser le mode mock si activé
    if (notionClient.isMockMode()) {
      const project = updateMockProject(id, data);
      if (!project) {
        return { success: false, error: { message: `Projet non trouvé: ${id}` } };
      }
      return { success: true, data: project };
    }

    // Préparer les propriétés pour Notion
    const properties: Record<string, any> = {};

    if (data.name !== undefined) {
      properties.Name = {
        title: [
          {
            text: {
              content: data.name
            }
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
            text: {
              content: data.description
            }
          }
        ]
      };
    }

    if (data.progress !== undefined) {
      properties.Progress = {
        number: data.progress
      };
    }

    if (data.status !== undefined) {
      properties.Status = {
        select: {
          name: data.status
        }
      };
    }

    // Mettre à jour le projet dans Notion
    const response = await notionClient.query({
      path: `/pages/${id}`,
      method: 'PATCH',
      headers: defaultHeaders,
      body: {
        properties
      }
    });

    if (!response.success) {
      return response;
    }

    // Convertir le résultat en projet
    const project = notionPageToProject(response.data);
    
    return { success: true, data: project };
  } catch (error) {
    return { 
      success: false, 
      error: { message: `Erreur lors de la mise à jour du projet ${id}`, details: error } 
    };
  }
}

/**
 * Supprime un projet de Notion
 */
export async function deleteProjectFromNotion(id: string): Promise<NotionResponse<boolean>> {
  try {
    // Vérifier que la configuration est disponible
    if (!notionClient.getConfig()) {
      return { success: false, error: { message: 'Configuration Notion non disponible' } };
    }

    // Utiliser le mode mock si activé
    if (notionClient.isMockMode()) {
      const success = deleteMockProject(id);
      if (!success) {
        return { success: false, error: { message: `Projet non trouvé: ${id}` } };
      }
      return { success: true, data: true };
    }

    // Vérifier que l'archivage est disponible
    const response = await notionClient.query({
      path: `/blocks/${id}`,
      method: 'DELETE',
      headers: defaultHeaders
    });

    if (!response.success) {
      return response;
    }

    return { success: true, data: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: `Erreur lors de la suppression du projet ${id}`, details: error } 
    };
  }
}

/**
 * Convertit les résultats de l'API Notion en projets
 */
function notionResultsToProjects(results: any[]): Project[] {
  return results.map(notionPageToProject);
}

/**
 * Convertit une page Notion en projet
 */
function notionPageToProject(page: any): Project {
  const properties = page.properties || {};
  
  return {
    id: page.id,
    name: getPropertyValue(properties.Name, 'title'),
    url: getPropertyValue(properties.URL, 'url'),
    description: getPropertyValue(properties.Description, 'rich_text'),
    progress: getPropertyValue(properties.Progress, 'number') || 0,
    status: getPropertyValue(properties.Status, 'select'),
    createdAt: formatDate(page.created_time),
    updatedAt: formatDate(page.last_edited_time)
  };
}

/**
 * Récupère la valeur d'une propriété Notion
 */
function getPropertyValue(property: any, type: string): any {
  if (!property) return null;

  switch (type) {
    case 'title':
    case 'rich_text':
      return property[type]?.[0]?.plain_text || '';
    case 'url':
      return property[type] || '';
    case 'number':
      return property[type] !== undefined ? property[type] : null;
    case 'select':
      return property[type]?.name || '';
    default:
      return null;
  }
}

// Fonctions mock
let mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Site E-commerce',
    url: 'https://ecommerce.example.com',
    description: 'Refonte du site e-commerce',
    progress: 25,
    status: 'En cours',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-20T14:30:00Z'
  },
  {
    id: 'project-2',
    name: 'Application mobile',
    url: 'https://mobile.example.com',
    description: 'Nouvelle application mobile',
    progress: 50,
    status: 'En cours',
    createdAt: '2023-02-01T09:15:00Z',
    updatedAt: '2023-02-10T16:45:00Z'
  }
];

function getMockProjects(): Project[] {
  return [...mockProjects];
}

function getMockProjectById(id: string): Project | undefined {
  return mockProjects.find(project => project.id === id);
}

function createMockProject(data: CreateProjectData): Project {
  const now = new Date().toISOString();
  const newProject: Project = {
    id: `project-${Date.now()}`,
    name: data.name,
    url: data.url || '',
    description: data.description || '',
    progress: data.progress || 0,
    status: data.status || 'Nouveau',
    createdAt: now,
    updatedAt: now
  };
  
  mockProjects.push(newProject);
  
  return newProject;
}

function updateMockProject(id: string, data: UpdateProjectData): Project | null {
  const index = mockProjects.findIndex(project => project.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedProject = {
    ...mockProjects[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  mockProjects[index] = updatedProject;
  
  return updatedProject;
}

function deleteMockProject(id: string): boolean {
  const initialLength = mockProjects.length;
  mockProjects = mockProjects.filter(project => project.id !== id);
  
  return mockProjects.length < initialLength;
}
