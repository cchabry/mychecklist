
/**
 * Type représentant un projet
 */
export type ProjectStatus = 'active' | 'completed' | 'pending' | 'archived';

export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status?: ProjectStatus;
  lastAuditDate?: string;
  progress?: number;
  pagesCount?: number;
  itemsCount?: number;
}
