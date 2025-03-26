
/**
 * Fonctionnalités liées aux projets
 */

import { notionService } from '@/services/notion/notionService';
import { Project } from '@/types/domain';

/**
 * Récupère tous les projets
 */
export async function getProjects(): Promise<Project[]> {
  const response = await notionService.getProjects();
  
  if (response.success && response.data) {
    return response.data;
  }
  
  // En cas d'erreur, jeter une exception pour que le hook puisse la gérer
  throw new Error(response.error?.message || 'Erreur lors de la récupération des projets');
}

/**
 * Récupère un projet par son ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const response = await notionService.getProjectById(id);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  // En cas d'erreur, jeter une exception
  throw new Error(response.error?.message || `Projet #${id} non trouvé`);
}

/**
 * Crée un nouveau projet
 */
export async function createProject(data: { name: string; url?: string }): Promise<Project> {
  const response = await notionService.createProject(data);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error?.message || 'Erreur lors de la création du projet');
}

/**
 * Met à jour un projet existant
 */
export async function updateProject(id: string, data: { name?: string; url?: string }): Promise<Project> {
  const response = await notionService.updateProject(id, data);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${id}`);
}

/**
 * Supprime un projet
 */
export async function deleteProject(id: string): Promise<boolean> {
  const response = await notionService.deleteProject(id);
  
  if (response.success && response.data) {
    return true;
  }
  
  throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
}
