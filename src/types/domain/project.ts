
/**
 * Types pour les projets
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}
