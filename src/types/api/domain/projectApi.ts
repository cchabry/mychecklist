
/**
 * Types pour les API de projets
 */

import { Project } from '@/types/domain';

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
