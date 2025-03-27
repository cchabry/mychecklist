
/**
 * Types pour les services d'actions correctives
 */

import { ActionStatus, ComplianceStatus, ActionPriority } from '@/types/domain/actionStatus';
import { CorrectiveAction, ActionProgress } from '@/types/domain';
import { NotionError } from '../types';

/**
 * Type de réponse pour une liste d'actions correctives
 */
export interface ActionListResponse {
  success: boolean;
  data?: CorrectiveAction[];
  error?: NotionError;
}

/**
 * Type de réponse pour une action corrective unique
 */
export interface ActionResponse {
  success: boolean;
  data?: CorrectiveAction;
  error?: NotionError;
}

/**
 * Type de réponse pour la suppression d'une action
 */
export interface ActionDeleteResponse {
  success: boolean;
  data?: boolean;
  error?: NotionError;
}

/**
 * Type pour la création d'une action corrective
 */
export interface CreateActionInput {
  evaluationId: string;
  targetScore: ComplianceStatus | number;
  priority: ActionPriority | number;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: ActionStatus | number;
}

/**
 * Type de réponse pour une liste de progrès d'action
 */
export interface ProgressListResponse {
  success: boolean;
  data?: ActionProgress[];
  error?: NotionError;
}

/**
 * Type de réponse pour un progrès d'action unique
 */
export interface ProgressResponse {
  success: boolean;
  data?: ActionProgress;
  error?: NotionError;
}

/**
 * Type de réponse pour la suppression d'un progrès d'action
 */
export interface ProgressDeleteResponse {
  success: boolean;
  data?: boolean;
  error?: NotionError;
}

/**
 * Type pour la création d'un progrès d'action
 */
export interface CreateProgressInput {
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceStatus | number;
  status: ActionStatus | number;
}
