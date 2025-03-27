
/**
 * Interface pour l'API des évaluations
 */

import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput } from '@/services/notion/evaluation/types';

export interface EvaluationApi {
  getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<Evaluation | null>;
  createEvaluation(evaluation: CreateEvaluationInput): Promise<Evaluation>;
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  deleteEvaluation(id: string): Promise<boolean>;
}
