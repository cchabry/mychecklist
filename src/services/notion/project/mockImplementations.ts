
/**
 * Implémentations mock pour le service de projets
 */

import { Project } from '@/types/domain';
import { CreateProjectInput, UpdateProjectInput } from './types';
import { generateMockId } from '../base/utils';

/**
 * Génère des projets fictifs pour le mode mock
 */
export async function getMockProjects(): Promise<Project[]> {
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
export async function mockCreateProject(data: CreateProjectInput): Promise<Project> {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateMockId('proj'),
    createdAt: now,
    updatedAt: now,
    progress: data.progress || 0,
    url: data.url || '',
    description: data.description || ''
  };
}

/**
 * Met à jour un projet fictif en mode mock
 */
export async function mockUpdateProject(entity: UpdateProjectInput): Promise<Project> {
  // Récupérer le projet existant
  const mockProjects = await getMockProjects();
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

