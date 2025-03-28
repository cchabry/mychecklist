
/**
 * Fonctionnalités liées aux projets
 * 
 * Ce module fournit des fonctions pour interagir avec les projets
 * via le service Notion, en gérant les conversions de données et
 * les erreurs.
 */

import { notionService } from '@/services/notion/notionService';
import { Project, CreateProjectData, UpdateProjectData } from './types';

// Réexporter les composants, hooks et utilitaires pour faciliter l'accès
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

/**
 * Récupère tous les projets depuis l'API Notion
 * 
 * @returns Promise résolvant vers un tableau de projets
 * @throws Error si la récupération échoue
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
 * Récupère un projet par son identifiant
 * 
 * @param id - Identifiant unique du projet
 * @returns Promise résolvant vers le projet ou null si non trouvé
 * @throws Error si la récupération échoue
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
 * 
 * @param data - Données du projet à créer
 * @returns Promise résolvant vers le projet créé
 * @throws Error si la création échoue
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  const response = await notionService.createProject(data);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error?.message || 'Erreur lors de la création du projet');
}

/**
 * Met à jour un projet existant
 * 
 * @param id - Identifiant unique du projet
 * @param data - Données à mettre à jour
 * @returns Promise résolvant vers le projet mis à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  const response = await notionService.updateProjectStd({
    ...data,
    id
  } as Project);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${id}`);
}

/**
 * Supprime un projet
 * 
 * @param id - Identifiant unique du projet à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteProject(id: string): Promise<boolean> {
  const response = await notionService.deleteProject(id);
  
  if (response.success) {
    return true;
  }
  
  throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
}
