/**
 * Types et interfaces pour le service d'évaluations
 */

import { Evaluation } from '@/types/domain';
import { ComplianceLevel } from '@/types/enums';

/**
 * Interface pour créer une évaluation
 */
export interface CreateEvaluationInput {
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceLevel;
  comment?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour mettre à jour une évaluation
 */
export interface UpdateEvaluationInput {
  id: string;
  score?: ComplianceLevel;
  comment?: string;
  attachments?: string[];
}

/**
 * Interface pour les filtres d'évaluation
 */
export interface EvaluationFilter {
  auditId: string;
  pageId?: string;
  exigenceId?: string;
}

/**
 * Interface pour les statistiques d'évaluation
 */
export interface EvaluationStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  partiallyCompliant: number;
  notApplicable: number;
  notEvaluated: number;
  complianceRate: number;
}

/**
 * Interface pour le résultat d'une évaluation groupée
 */
export interface GroupedEvaluations {
  byPage: Record<string, Evaluation[]>;
  byExigence: Record<string, Evaluation[]>;
}
