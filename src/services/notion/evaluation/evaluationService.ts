
/**
 * Façade pour le service d'évaluation
 * 
 * Ce service fournit une interface simplifiée pour interagir avec les évaluations,
 * tout en utilisant l'implémentation standardisée sous-jacente.
 */

import { evaluationServiceImpl } from './EvaluationServiceImpl';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput, UpdateEvaluationInput } from './types';

/**
 * Service de gestion des évaluations
 */
class EvaluationService {
  /**
   * Récupère les évaluations d'un audit
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    return evaluationServiceImpl.getEvaluationsByAudit(auditId, pageId, exigenceId);
  }
  
  /**
   * Récupère une évaluation par son ID
   */
  async getEvaluationById(id: string): Promise<NotionResponse<Evaluation>> {
    return evaluationServiceImpl.getById(id);
  }
  
  /**
   * Crée une nouvelle évaluation
   */
  async createEvaluation(evaluation: CreateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    return evaluationServiceImpl.create(evaluation);
  }
  
  /**
   * Met à jour une évaluation existante
   */
  async updateEvaluation(evaluation: UpdateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    return evaluationServiceImpl.update(evaluation);
  }
  
  /**
   * Supprime une évaluation
   */
  async deleteEvaluation(id: string): Promise<NotionResponse<boolean>> {
    return evaluationServiceImpl.delete(id);
  }
}

// Créer et exporter une instance singleton
export const evaluationService = new EvaluationService();

// Export par défaut
export default evaluationService;
