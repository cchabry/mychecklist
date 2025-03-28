
/**
 * Types pour le service d'actions
 */

import { CorrectiveAction, ActionProgress } from '@/types/domain';
import { StatusType, PriorityLevel, ComplianceLevel } from '@/types/enums';
import { ComplianceStatus, ActionPriority, ActionStatus } from '@/types/domain/actionStatus';

/**
 * Entrée pour la création d'une action
 */
export interface CreateActionInput {
  evaluationId: string;
  targetScore: ComplianceLevel;
  priority: PriorityLevel;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: StatusType;
}

/**
 * Version interne du CreateActionInput pour la compatibilité avec les tests
 */
export interface CreateActionInputInternal {
  evaluationId: string;
  targetScore: ComplianceStatus | ComplianceLevel;
  priority: ActionPriority | PriorityLevel;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: ActionStatus | StatusType;
}

/**
 * Entrée pour la création d'un progrès
 */
export interface CreateProgressInput {
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceLevel;
  status: StatusType;
}

/**
 * Interface pour le service d'actions
 */
export interface ActionServiceInterface {
  getActions(evaluationId: string): Promise<CorrectiveAction[]>;
  getActionById(id: string): Promise<CorrectiveAction | null>;
  createAction(action: CreateActionInput): Promise<CorrectiveAction>;
  updateAction(action: CorrectiveAction): Promise<CorrectiveAction>;
  deleteAction(id: string): Promise<boolean>;
  getActionProgress(actionId: string): Promise<ActionProgress[]>;
  getActionProgressById(id: string): Promise<ActionProgress | null>;
  createActionProgress(progress: CreateProgressInput): Promise<ActionProgress>;
  updateActionProgress(progress: ActionProgress): Promise<ActionProgress>;
  deleteActionProgress(id: string): Promise<boolean>;
}
