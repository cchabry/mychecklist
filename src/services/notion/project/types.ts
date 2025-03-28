
/**
 * Types pour le service de projets
 */

import { Project } from '@/types/domain';

/**
 * Type pour la création d'un projet
 */
export interface CreateProjectInput {
  name: string;
  url?: string;
  description?: string;
  progress?: number;
}

/**
 * Type pour la mise à jour d'un projet
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  url?: string;
  description?: string;
  progress?: number;
}

