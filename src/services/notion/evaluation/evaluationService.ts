
/**
 * Service pour la gestion des évaluations via Notion
 * 
 * Ce service fournit les fonctionnalités nécessaires pour interagir avec
 * les données d'évaluation, soit via l'API Notion, soit en mode simulation.
 */

import { notionClient } from '../notionClient';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { ComplianceLevel } from '@/types/enums';
import { generateMockEvaluations } from './utils';
import { CreateEvaluationInput } from './types';

/**
 * Service de gestion des évaluations
 */
class EvaluationService {
  /**
   * Récupère les évaluations d'un audit
   * 
   * Permet de filtrer optionnellement par page et/ou exigence.
   * 
   * @param auditId - Identifiant de l'audit
   * @param pageId - Identifiant de la page (optionnel)
   * @param exigenceId - Identifiant de l'exigence (optionnel)
   * @returns Réponse contenant les évaluations ou une erreur
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
   * 
   * @param id - Identifiant unique de l'évaluation
   * @returns Réponse contenant l'évaluation ou une erreur
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
      score: ComplianceLevel.PartiallyCompliant,
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
   * 
   * @param evaluation - Données de l'évaluation à créer
   * @returns Réponse contenant l'évaluation créée ou une erreur
   */
  async createEvaluation(evaluation: CreateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        createdAt: evaluation.createdAt || new Date().toISOString(),
        updatedAt: evaluation.updatedAt || new Date().toISOString()
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
        createdAt: evaluation.createdAt || new Date().toISOString(),
        updatedAt: evaluation.updatedAt || new Date().toISOString()
      }
    };
  }
  
  /**
   * Met à jour une évaluation existante
   * 
   * @param evaluation - Données complètes de l'évaluation avec les modifications
   * @returns Réponse contenant l'évaluation mise à jour ou une erreur
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
   * 
   * @param _id - Identifiant unique de l'évaluation à supprimer
   * @returns Réponse indiquant le succès ou l'échec de la suppression
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
