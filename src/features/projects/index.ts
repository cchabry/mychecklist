
/**
 * Point d'entrée pour la fonctionnalité projets
 */

// Exporter les types
export * from './types';

// Exporter les hooks
export * from './hooks';

// Importer les services API
import { projectsApi } from '@/services/notion/api/projects';

/**
 * Récupère tous les projets
 */
export async function getProjects() {
  return projectsApi.getProjects();
}

/**
 * Récupère un projet par son ID
 */
export async function getProjectById(id: string) {
  return projectsApi.getProjectById(id);
}

/**
 * Crée un nouveau projet
 */
export async function createProject(data: import('./types').CreateProjectData) {
  return projectsApi.createProject(data);
}

/**
 * Met à jour un projet existant
 */
export async function updateProject(id: string, data: import('./types').UpdateProjectData) {
  return projectsApi.updateProject(id, data);
}

/**
 * Supprime un projet
 */
export async function deleteProject(id: string) {
  return projectsApi.deleteProject(id);
}
