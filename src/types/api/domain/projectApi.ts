
/**
 * Types pour l'API de projet
 */

import { Project } from '@/types/domain';
import { ProjectStatus } from '@/types/enums';

/**
 * Données pour créer un nouveau projet
 */
export interface CreateProjectData {
  name: string;
  url?: string;
  description?: string;
  status?: ProjectStatus;
}

/**
 * Données pour mettre à jour un projet existant
 */
export interface UpdateProjectData {
  name?: string;
  url?: string;
  description?: string;
  status?: ProjectStatus;
  progress?: number;
}

/**
 * Interface pour l'API des projets
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
