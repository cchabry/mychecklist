
/**
 * Types spécifiques aux projets
 * 
 * Ce fichier définit les types utilisés dans la fonctionnalité de gestion des projets
 */

import { Project } from '@/types/domain/project';
import { ProjectStatus } from '@/types/enums';

export type { Project };

/**
 * Type pour la création d'un projet
 */
export type CreateProjectData = {
  name: string;
  url?: string;
  description?: string;
};

/**
 * Type pour la mise à jour d'un projet
 */
export type UpdateProjectData = {
  name?: string;
  url?: string;
  description?: string;
  status?: ProjectStatus;
};
