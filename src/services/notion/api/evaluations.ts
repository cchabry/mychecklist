
/**
 * API pour les évaluations
 */

import { evaluationService } from '../evaluationService';
import { Evaluation } from '@/types/domain';
import { EvaluationApi } from '@/types/api/domain';

/**
 * Implémentation de l'API des évaluations
 */
export const evaluationsApi: EvaluationApi = {
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
    const response = await evaluationService.getEvaluations(auditId, pageId, exigenceId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la récupération des évaluations');
    }
    
    return response.data;
  },
  
  async getEvaluationById(id: string): Promise<Evaluation> {
    const response = await evaluationService.getEvaluationById(id);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || `Évaluation #${id} non trouvée`);
    }
    
    return response.data;
  },
  
  async createEvaluation(evaluation: Omit<Evaluation, 'id'>): Promise<Evaluation> {
    const response = await evaluationService.createEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création de l\'évaluation');
    }
    
    return response.data;
  },
  
  async updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const response = await evaluationService.updateEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || `Erreur lors de la mise à jour de l'évaluation #${evaluation.id}`);
    }
    
    return response.data;
  },
  
  async deleteEvaluation(id: string): Promise<boolean> {
    const response = await evaluationService.deleteEvaluation(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || `Erreur lors de la suppression de l'évaluation #${id}`);
    }
    
    return response.data || false;
  }
};
