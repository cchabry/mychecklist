
/**
 * Types pour le service d'évaluation
 */

import { Evaluation } from '@/types/domain';
import { NotionResponse } from '../types';

/**
 * Paramètres de filtrage des évaluations
 */
export interface EvaluationFilters {
  auditId?: string;
  pageId?: string;
  exigenceId?: string;
  status?: number;
}

/**
 * Réponse API pour une liste d'évaluations
 */
export type EvaluationListResponse = NotionResponse<Evaluation[]>;

/**
 * Réponse API pour une seule évaluation
 */
export type EvaluationResponse = NotionResponse<Evaluation>;

/**
 * Réponse API pour la suppression d'une évaluation
 */
export type EvaluationDeleteResponse = NotionResponse<boolean>;

/**
 * Données minimales pour la création d'une évaluation
 */
export interface CreateEvaluationInput {
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: number;
  comment?: string;
  attachments?: string[];
}
