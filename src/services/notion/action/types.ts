
/**
 * Types pour les services d'actions et de progrès
 */

import { ComplianceLevel, StatusType, PriorityLevel } from '@/types/enums';

/**
 * Interface pour les données de création d'une action
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
 * Interface pour les données de création d'un progrès
 */
export interface CreateProgressInput {
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceLevel; // Utilisation de ComplianceLevel enum, pas number
  status: StatusType;
}
