
/**
 * Implémentation de l'API des évaluations
 */

import { EvaluationApi } from '@/types/api/domain';
import { Evaluation } from '@/types/domain';
import { evaluationService } from '../evaluationService';

export class NotionEvaluationApi implements EvaluationApi {
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
    const response = await evaluationService.getEvaluations(auditId, pageId, exigenceId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des évaluations");
    }
    return response.data || [];
  }
  
  async getEvaluationById(id: string): Promise<Evaluation> {
    const response = await evaluationService.getEvaluationById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Évaluation #${id} non trouvée`);
    }
    return response.data as Evaluation;
  }
  
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation> {
    const response = await evaluationService.createEvaluation(evaluation);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'évaluation");
    }
    return response.data as Evaluation;
  }
  
  async updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const response = await evaluationService.updateEvaluation(evaluation);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'évaluation");
    }
    return response.data as Evaluation;
  }
  
  async deleteEvaluation(id: string): Promise<boolean> {
    const response = await evaluationService.deleteEvaluation(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'évaluation");
    }
    return true;
  }
}

export const evaluationsApi = new NotionEvaluationApi();
