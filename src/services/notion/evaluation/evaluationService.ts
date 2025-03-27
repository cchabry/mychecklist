
/**
 * Service pour la gestion des évaluations via Notion
 */

import { notionClient } from '../notionClient';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { generateMockEvaluations } from './utils';

/**
 * Service de gestion des évaluations
 */
class EvaluationService {
  /**
   * Récupère les évaluations d'un audit
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: generateMockEvaluations(auditId, pageId, exigenceId)
      };
    }
    
    // TODO: Implémenter la récupération des évaluations depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: generateMockEvaluations(auditId, pageId, exigenceId)
    };
  }
  
  /**
   * Récupère une évaluation par son ID
   */
  async getEvaluationById(id: string): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockEvaluations = generateMockEvaluations('mock-audit');
      const evaluation = mockEvaluations.find(e => e.id === id);
      
      if (!evaluation) {
        return { 
          success: false, 
          error: { message: `Évaluation #${id} non trouvée` } 
        };
      }
      
      return {
        success: true,
        data: evaluation
      };
    }
    
    // TODO: Implémenter la récupération d'une évaluation depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    const mockEvaluation: Evaluation = {
      id,
      auditId: 'mock-audit',
      pageId: 'mock-page',
      exigenceId: 'mock-exigence',
      score: 2, // ComplianceLevel.PartiallyCompliant
      comment: "Évaluation d'exemple",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockEvaluation
    };
  }
  
  /**
   * Crée une nouvelle évaluation
   */
  async createEvaluation(evaluation: Omit<Evaluation, 'id'>): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newEvaluation
      };
    }
    
    // TODO: Implémenter la création d'une évaluation dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...evaluation,
        id: `eval-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Met à jour une évaluation existante
   */
  async updateEvaluation(evaluation: Evaluation): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: {
          ...evaluation,
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    // TODO: Implémenter la mise à jour d'une évaluation dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...evaluation,
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Supprime une évaluation
   */
  async deleteEvaluation(_id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'une évaluation dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
}

// Créer et exporter une instance singleton
export const evaluationService = new EvaluationService();

// Export par défaut
export default evaluationService;
