
import { ActionStatus } from './action';

/**
 * Interface représentant un audit
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in-progress' | 'completed' | 'planned';
  progress: number;
  actionsCount?: {
    total: number;
    [ActionStatus.ToDo]: number;
    [ActionStatus.InProgress]: number;
    [ActionStatus.Done]: number;
    [ActionStatus.Canceled]: number;
  };
}
