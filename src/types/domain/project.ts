
/**
 * Types pour les projets
 */

export interface Project {
  id: string;
  name: string;
  description: string; // Changed from optional to required
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number; // Changed from optional to required
}
