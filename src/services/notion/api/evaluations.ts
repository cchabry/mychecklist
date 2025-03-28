
/**
 * API Notion pour les évaluations
 * 
 * Ce module fournit l'implémentation de l'interface EvaluationApi
 * pour accéder aux données d'évaluation via l'API Notion ou en mode mock.
 */

import { EvaluationApi } from '@/types/api/domain';
import { evaluationService } from '../evaluation';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput } from '../evaluation/types';
import { DELETE_ERROR, FETCH_ERROR, CREATE_ERROR, UPDATE_ERROR } from '@/constants/errorMessages';

/**
 * Implémentation de l'API d'évaluations utilisant le service Notion
 */
class NotionEvaluationApi implements EvaluationApi {
  /**
   * Récupère les évaluations correspondant aux critères fournis
   * 
   * @param auditId - Identifiant de l'audit
   * @param pageId - Identifiant de la page (optionnel)
   * @param exigenceId - Identifiant de l'exigence (optionnel)
   * @returns Promise résolvant vers un tableau d'évaluations
   * @throws Error si la récupération échoue
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
   * 
   * @param id - Identifiant unique de l'évaluation
   * @returns Promise résolvant vers l'évaluation ou null si non trouvée
   * @throws Error si la récupération échoue de manière inattendue
   */
  async getEvaluationById(id: string): Promise<Evaluation | null> {
    const response = await evaluationService.getEvaluationById(id);
    
    if (!response.success) {
      return null;
    }
    
    // Explicitement convertir `undefined` en `null` pour respecter le type de retour
    return response.data || null;
  }
  
  /**
   * Crée une nouvelle évaluation
   * 
   * @param evaluation - Données de l'évaluation à créer
   * @returns Promise résolvant vers l'évaluation créée
   * @throws Error si la création échoue
   */
  async createEvaluation(evaluation: CreateEvaluationInput): Promise<Evaluation> {
    const response = await evaluationService.createEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || CREATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Met à jour une évaluation existante
   * 
   * @param evaluation - Données complètes de l'évaluation avec les modifications
   * @returns Promise résolvant vers l'évaluation mise à jour
   * @throws Error si la mise à jour échoue
   */
  async updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const response = await evaluationService.updateEvaluation(evaluation);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || UPDATE_ERROR);
    }
    
    return response.data;
  }
  
  /**
   * Supprime une évaluation
   * 
   * @param id - Identifiant unique de l'évaluation à supprimer
   * @returns Promise résolvant vers true si la suppression a réussi
   * @throws Error si la suppression échoue
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
