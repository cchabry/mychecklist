
/**
 * API Notion pour les évaluations
 */

import { evaluationService } from '../evaluation';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput } from '../evaluation/types';

/**
 * API pour accéder aux évaluations
 */
export const evaluationsApi = {
  /**
   * Récupère les évaluations d'un audit
   */
  getEvaluations: async (auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> => {
    const response = await evaluationService.getEvaluations(auditId, pageId, exigenceId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la récupération des évaluations');
    }
    
    return response.data;
  },
  
  /**
   * Récupère une évaluation par son ID
   */
  getEvaluationById: async (id: string): Promise<Evaluation | null> => {
    const response = await evaluationService.getEvaluationById(id);
    
    if (!response.success || !response.data) {
      return null;
    }
    
    return response.data;
  },
  
  /**
   * Crée une nouvelle évaluation
   */
  createEvaluation: async (evaluation: CreateEvaluationInput): Promise<Evaluation> => {
    const response = await evaluationService.createEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création de l\'évaluation');
    }
    
    return response.data;
  },
  
  /**
   * Met à jour une évaluation existante
   */
  updateEvaluation: async (evaluation: Evaluation): Promise<Evaluation> => {
    const response = await evaluationService.updateEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la mise à jour de l\'évaluation');
    }
    
    return response.data;
  },
  
  /**
   * Supprime une évaluation
   */
  deleteEvaluation: async (id: string): Promise<boolean> => {
    const response = await evaluationService.deleteEvaluation(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur lors de la suppression de l\'évaluation');
    }
    
    return response.data ?? false;
  }
};
