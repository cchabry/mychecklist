/**
 * Types pour les services d'actions et de progrès
 */

import { ComplianceLevel, StatusType, PriorityLevel } from '@/types/enums';
import { ComplianceStatus, ActionPriority, ActionStatus } from '@/types/domain/actionStatus';

/**
 * Interface pour les données de création d'une action
 */
export interface CreateActionInput {
  evaluationId: string;
  targetScore: ComplianceLevel | ComplianceStatus;
  priority: PriorityLevel | ActionPriority;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: StatusType | ActionStatus;
}

/**
 * Interface pour les données de création d'un progrès
 */
export interface CreateProgressInput {
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceLevel | ComplianceStatus;
  status: StatusType | ActionStatus;
}
