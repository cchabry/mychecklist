
/**
 * Types pour la feature Evaluations
 */

import { ComplianceLevel } from '@/types/enums';

// Re-export avec 'export type' pour isolatedModules
export type { Evaluation } from '@/types/domain';

/**
 * Type pour les filtres d'évaluations
 */
export interface EvaluationFilters {
  score?: ComplianceLevel;
  search?: string;
  exigenceId?: string;
  pageId?: string;
}

/**
 * Type pour la création d'une évaluation
 */
export type CreateEvaluationData = {
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceLevel;
  comment?: string;
  attachments?: string[];
};

/**
 * Type pour la mise à jour d'une évaluation
 */
export type UpdateEvaluationData = {
  score?: ComplianceLevel;
  comment?: string;
  attachments?: string[];
};
