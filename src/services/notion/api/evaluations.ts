
/**
 * API Notion pour les évaluations
 * 
 * Ce module fournit l'implémentation de l'interface EvaluationApi
 * pour accéder aux données d'évaluation via l'API Notion ou en mode mock.
 */

import { EvaluationApi } from '@/types/api/domain';
import { evaluationService } from '../evaluation';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput, UpdateEvaluationInput } from '../evaluation/types';
import { DELETE_ERROR, FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR } from '@/constants/errorMessages';

/**
 * Implémentation de l'API d'évaluations utilisant le service Notion
 */
class NotionEvaluationApi implements EvaluationApi {
  /**
   * Récupère les évaluations correspondant aux critères fournis
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
    const response = await evaluationService.getEvaluations(auditId, pageId, exigenceId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || FETCH_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Récupère une évaluation par son ID
   */
  async getEvaluationById(id: string): Promise<Evaluation | null> {
    const response = await evaluationService.getEvaluationById(id);
    
    if (!response.success) {
      return null;
    }
    
    return response.data || null;
  }
  
  /**
   * Crée une nouvelle évaluation
   */
  async createEvaluation(evaluation: Omit<Evaluation, "id" | "createdAt" | "updatedAt">): Promise<Evaluation> {
    const createInput: CreateEvaluationInput = {
      auditId: evaluation.auditId,
      pageId: evaluation.pageId,
      exigenceId: evaluation.exigenceId,
      score: evaluation.score,
      comment: evaluation.comment,
      attachments: evaluation.attachments
    };
    
    const response = await evaluationService.createEvaluation(createInput);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour une évaluation existante
   */
  async updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const updateInput: UpdateEvaluationInput = {
      id: evaluation.id,
      score: evaluation.score,
      comment: evaluation.comment,
      attachments: evaluation.attachments
    };
    
    const response = await evaluationService.updateEvaluation(updateInput);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Supprime une évaluation
   */
  async deleteEvaluation(id: string): Promise<boolean> {
    const response = await evaluationService.deleteEvaluation(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || DELETE_ERROR);
    }
    
    return response.data ?? false;
  }
}

// Exporter une instance singleton
export const evaluationsApi = new NotionEvaluationApi();

// Export par défaut
export default evaluationsApi;
