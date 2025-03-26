
/**
 * Types pour les projets
 */

/**
 * Représente un projet à auditer
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
}
