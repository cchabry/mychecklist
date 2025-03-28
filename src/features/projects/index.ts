
/**
 * Point d'entrée pour la fonctionnalité projets
 */

// Exporter les types
export * from './types';

// Exporter les hooks
export * from './hooks';

// Importer les services API
import { projectsApi } from '@/services/notion/api/projects';
import { CreateProjectData, UpdateProjectData } from '@/types/api/domain/projectApi';
import { Project } from '@/types/domain';

/**
 * Récupère tous les projets
 */
export async function getProjects(): Promise<Project[]> {
  return projectsApi.getProjects();
}

/**
 * Récupère un projet par son ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  return projectsApi.getProjectById(id);
}

/**
 * Crée un nouveau projet
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  return projectsApi.createProject(data);
}

/**
 * Met à jour un projet existant
 */
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  return projectsApi.updateProject(id, data);
}

/**
 * Supprime un projet
 */
export async function deleteProject(id: string): Promise<boolean> {
  return projectsApi.deleteProject(id);
}
