
/**
 * Interface pour l'API des évaluations
 */

import { Evaluation } from '@/types/domain';

export interface EvaluationApi {
  getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<Evaluation | null>;
  createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation>;
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  deleteEvaluation(id: string): Promise<boolean>;
}
