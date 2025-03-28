
/**
 * Fonctionnalités liées aux projets
 * 
 * Ce module fournit des fonctions pour interagir avec les projets
 * via le service Notion, en gérant les conversions de données et
 * les erreurs.
 */

import { notionService } from '@/services/notion/notionService';
import { Project, CreateProjectData, UpdateProjectData } from './types';
import { projectsApi } from '@/services/notion/api/projects';

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
  try {
    // Utiliser directement l'API refactorisée
    return await projectsApi.getProjects();
  } catch (error) {
    // En cas d'erreur, jeter une exception pour que le hook puisse la gérer
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des projets');
  }
}

/**
 * Récupère un projet par son identifiant
 * 
 * @param id - Identifiant unique du projet
 * @returns Promise résolvant vers le projet ou null si non trouvé
 * @throws Error si la récupération échoue
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    return await projectsApi.getProjectById(id);
  } catch (error) {
    // En cas d'erreur, jeter une exception
    throw new Error(error instanceof Error ? error.message : `Projet #${id} non trouvé`);
  }
}

/**
 * Crée un nouveau projet
 * 
 * @param data - Données du projet à créer
 * @returns Promise résolvant vers le projet créé
 * @throws Error si la création échoue
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    return await projectsApi.createProject(data);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la création du projet');
  }
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
  try {
    // Récupérer d'abord le projet existant
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      throw new Error(`Projet #${id} non trouvé`);
    }
    
    // Fusionner les données existantes avec les nouvelles
    const updatedProject = {
      ...existingProject,
      ...data,
    };
    
    return await projectsApi.updateProject(updatedProject);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : `Erreur lors de la mise à jour du projet #${id}`);
  }
}

/**
 * Supprime un projet
 * 
 * @param id - Identifiant unique du projet à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    return await projectsApi.deleteProject(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : `Erreur lors de la suppression du projet #${id}`);
  }
}
