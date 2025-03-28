
/**
 * Types pour les API de projets
 */

import { Project } from '@/types/domain';

/**
 * Interface pour l'API de projets
 */
export interface ProjectApi {
  /**
   * Récupère tous les projets
   */
  getProjects(): Promise<Project[]>;
  
  /**
   * Récupère un projet par son ID
   */
  getProjectById(id: string): Promise<Project | null>;
  
  /**
   * Crée un nouveau projet
   */
  createProject(data: CreateProjectData): Promise<Project>;
  
  /**
   * Met à jour un projet existant
   */
  updateProject(id: string, data: UpdateProjectData): Promise<Project>;
  
  /**
   * Supprime un projet
   */
  deleteProject(id: string): Promise<boolean>;
}

/**
 * Type pour la création d'un projet
 */
export interface CreateProjectData {
  name: string;
  url?: string;
  description?: string;
  progress?: number;
}

/**
 * Type pour la mise à jour d'un projet
 */
export interface UpdateProjectData {
  name?: string;
  url?: string;
  description?: string;
  progress?: number;
  status?: string;
}
