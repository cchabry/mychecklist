
/**
 * Type représentant un projet
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}
