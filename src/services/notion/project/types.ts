
/**
 * Types pour le service de projets
 */

import { Project } from '@/types/domain';

// Réexporter le type Project pour faciliter l'accès
export type { Project };

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
