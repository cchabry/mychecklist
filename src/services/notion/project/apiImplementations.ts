
/**
 * Implémentations API pour les projets Notion
 */

// Ajout des imports nécessaires
import { Project } from '@/types/domain';
import { NotionResponse } from '../types';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { notionPageToProject } from './utils';

/**
 * Récupère tous les projets depuis Notion
 */
export function getAllProjectsNotionImplementation(): Promise<NotionResponse<Project[]>> {
  // Cette méthode sera implémentée une fois l'API Notion correctement configurée
  return Promise.resolve({ 
    success: true, 
    data: mockGetProjects() 
  });
}

/**
 * Récupère un projet par son ID depuis Notion
 */
export function getProjectByIdNotionImplementation(id: string): Promise<NotionResponse<Project>> {
  const project = mockGetProjects().find(p => p.id === id);
  
  if (!project) {
    return Promise.resolve({ 
      success: false, 
      error: { message: `Projet non trouvé: ${id}` } 
    });
  }
  
  return Promise.resolve({ success: true, data: project });
}

/**
 * Crée un nouveau projet dans Notion
 */
export function createProjectNotionImplementation(data: CreateProjectInput): Promise<NotionResponse<Project>> {
  return Promise.resolve({ 
    success: true, 
    data: mockCreateProject(data) 
  });
}

/**
 * Met à jour un projet existant dans Notion
 */
export function updateProjectNotionImplementation(entity: UpdateProjectInput): Promise<NotionResponse<Project>> {
  try {
    const project = mockUpdateProject(entity);
    return Promise.resolve({ success: true, data: project });
  } catch (error) {
    return Promise.resolve({ 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'Erreur inconnue' } 
    });
  }
}

/**
 * Supprime un projet dans Notion
 */
export function deleteProjectNotionImplementation(id: string): Promise<NotionResponse<boolean>> {
  const exists = mockGetProjects().some(p => p.id === id);
  
  if (!exists) {
    return Promise.resolve({ 
      success: false, 
      error: { message: `Projet non trouvé: ${id}` } 
    });
  }
  
  return Promise.resolve({ success: true, data: true });
}

/**
 * Génère des projets fictifs pour le mode mock
 */
export function mockGetProjects(): Project[] {
  return [
    {
      id: 'project-1',
      name: 'Site E-commerce',
      url: 'https://ecommerce.example.com',
      description: 'Refonte du site e-commerce',
      progress: 25,
      status: 'IN_PROGRESS',
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2023-01-20T14:30:00Z'
    },
    {
      id: 'project-2',
      name: 'Application mobile',
      url: 'https://mobile.example.com',
      description: 'Nouvelle application mobile',
      progress: 50,
      status: 'IN_PROGRESS',
      createdAt: '2023-02-01T09:15:00Z',
      updatedAt: '2023-02-10T16:45:00Z'
    }
  ];
}

/**
 * Crée un projet fictif en mode mock
 */
export function mockCreateProject(data: CreateProjectInput): Project {
  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}`,
    name: data.name,
    url: data.url || '',
    description: data.description || '',
    progress: data.progress || 0,
    status: data.status || 'NEW',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Met à jour un projet fictif en mode mock
 */
export function mockUpdateProject(entity: UpdateProjectInput): Project {
  const existingProject = mockGetProjects().find(p => p.id === entity.id);
  if (!existingProject) {
    throw new Error(`Project not found: ${entity.id}`);
  }
  
  return {
    ...existingProject,
    name: entity.name || existingProject.name,
    url: entity.url !== undefined ? entity.url : existingProject.url,
    description: entity.description !== undefined ? entity.description : existingProject.description,
    progress: entity.progress !== undefined ? entity.progress : existingProject.progress,
    status: entity.status || existingProject.status,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Supprime un projet fictif en mode mock
 */
export function mockDeleteProject(id: string): boolean {
  return mockGetProjects().some(p => p.id === id);
}
