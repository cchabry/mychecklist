
/**
 * Type représentant un projet
 */
export interface Project {
  id: string;
  name: string;
  url?: string; // Rendu optionnel pour correspondre à l'implémentation
  description?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'completed' | 'pending' | 'archived';
  lastAuditDate?: string;
  progress?: number;
}
