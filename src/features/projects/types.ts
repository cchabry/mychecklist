
/**
 * Types pour la feature projets
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
 * État des projets
 */
export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Filtres pour les projets
 */
export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'progress';
  sortDirection?: 'asc' | 'desc';
}
