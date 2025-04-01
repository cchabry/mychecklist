
/**
 * Types pour les actions correctives
 */

/**
 * Priorité d'une action corrective
 */
export enum ActionPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

/**
 * Statut d'une action corrective
 */
export enum ActionStatus {
  ToDo = 'todo',
  InProgress = 'in-progress',
  Done = 'done',
  Canceled = 'canceled'
}

/**
 * Action corrective
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: any; // ComplianceStatus
  priority: ActionPriority;
  status: ActionStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
  responsible?: string;
  dueDate?: string;
}

/**
 * Progression d'une action corrective
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  comment: string;
  author?: string;
  responsible?: string;
  newStatus: ActionStatus;
}
