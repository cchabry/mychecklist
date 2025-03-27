
/**
 * Types pour la feature Actions
 */

import { PriorityLevel, StatusType, ComplianceLevel } from '@/types/enums';
import { ActionProgress } from '@/types/domain/progress';

// Re-export avec 'export type' pour isolatedModules
export type { CorrectiveAction } from '@/types/domain';
export type { ActionProgress };

/**
 * Type pour les filtres d'actions
 */
export interface ActionFilters {
  priority?: PriorityLevel;
  status?: StatusType;
  search?: string;
  responsible?: string;
}

/**
 * Type pour les options de tri
 */
export type ActionSortOption = 'priority_desc' | 'priority_asc' | 'dueDate_asc' | 'dueDate_desc' | 'status_asc' | 'status_desc';

/**
 * Type pour la création d'une action
 */
export type CreateActionData = {
  evaluationId: string;
  targetScore: ComplianceLevel;
  priority: PriorityLevel;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: StatusType; // Ajout du champ manquant
};

/**
 * Type pour la mise à jour d'une action
 */
export type UpdateActionData = {
  targetScore?: ComplianceLevel;
  priority?: PriorityLevel;
  dueDate?: string;
  responsible?: string;
  comment?: string;
  status?: StatusType;
};

/**
 * Type pour la création d'un progrès d'action
 */
export type CreateProgressData = {
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceLevel;
  status: StatusType;
};
