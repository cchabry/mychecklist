
/**
 * Types spécifiques aux projets
 */

import { ProjectStatus } from '@/types/enums';

/**
 * Données d'entrée pour la création d'un projet
 */
export interface CreateProjectInput {
  name: string;
  url?: string;
  description?: string;
  progress?: number;
  status?: ProjectStatus;
}

/**
 * Données d'entrée pour la mise à jour d'un projet
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  url?: string;
  description?: string;
  progress?: number;
  status?: ProjectStatus;
}
