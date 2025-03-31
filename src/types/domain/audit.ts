
import { ActionStatus } from './action';

/**
 * Type représentant un audit
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'archived';
  progress?: number;
  completedAt?: string;
  itemsCount?: number;
  version?: string;
  actionsCount?: {
    total: number;
    [ActionStatus.ToDo]: number;
    [ActionStatus.InProgress]: number;
    [ActionStatus.Done]: number;
    [key: string]: number;
  };
}
