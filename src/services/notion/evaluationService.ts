
/**
 * Service pour la gestion des évaluations via Notion
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { Evaluation, ComplianceStatus } from '@/types/domain';

/**
 * Service de gestion des évaluations
 */
class EvaluationService {
  /**
   * Récupère toutes les évaluations d'un audit, filtrées optionnellement par page et/ou exigence
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      let evaluations = this.getMockEvaluations(auditId);
      
      // Appliquer les filtres si spécifiés
      if (pageId) {
        evaluations = evaluations.filter(e => e.pageId === pageId);
      }
      
      if (exigenceId) {
        evaluations = evaluations.filter(e => e.exigenceId === exigenceId);
      }
      
      return {
        success: true,
        data: evaluations
      };
    }
    
    // TODO: Implémenter la récupération des évaluations depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    let evaluations = this.getMockEvaluations(auditId);
    
    // Appliquer les filtres si spécifiés
    if (pageId) {
      evaluations = evaluations.filter(e => e.pageId === pageId);
    }
    
    if (exigenceId) {
      evaluations = evaluations.filter(e => e.exigenceId === exigenceId);
    }
    
    return {
      success: true,
      data: evaluations
    };
  }
  
  /**
   * Récupère une évaluation par son ID
   */
  async getEvaluationById(id: string): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockEvaluations = this.getMockEvaluations('mock-audit');
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
    return {
      success: true,
      data: {
        id,
        auditId: 'mock-audit',
        pageId: 'mock-page',
        exigenceId: 'mock-exigence',
        score: ComplianceStatus.PartiallyCompliant,
        comment: "Partiellement conforme, des améliorations requises",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Crée une nouvelle évaluation
   */
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const now = new Date().toISOString();
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: `eval-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      
      return {
        success: true,
        data: newEvaluation
      };
    }
    
    // TODO: Implémenter la création d'une évaluation dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    const now = new Date().toISOString();
    return {
      success: true,
      data: {
        ...evaluation,
        id: `eval-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      }
    };
  }
  
  /**
   * Met à jour une évaluation existante
   */
  async updateEvaluation(evaluation: Evaluation): Promise<NotionResponse<Evaluation>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      const updatedEvaluation: Evaluation = {
        ...evaluation,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: updatedEvaluation
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
  async deleteEvaluation(id: string): Promise<NotionResponse<boolean>> {
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
  
  /**
   * Génère des évaluations fictives pour le mode démo
   */
  private getMockEvaluations(auditId: string): Evaluation[] {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'eval-1',
        auditId,
        pageId: 'page-1',
        exigenceId: 'exig-1',
        score: ComplianceStatus.Compliant,
        comment: "Toutes les images ont des attributs alt appropriés",
        attachments: ["screenshot1.png"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'eval-2',
        auditId,
        pageId: 'page-1',
        exigenceId: 'exig-2',
        score: ComplianceStatus.PartiallyCompliant,
        comment: "Certaines images ne sont pas optimisées",
        attachments: ["screenshot2.png", "report.pdf"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'eval-3',
        auditId,
        pageId: 'page-2',
        exigenceId: 'exig-1',
        score: ComplianceStatus.NonCompliant,
        comment: "Plusieurs images sans attributs alt",
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}

// Créer et exporter une instance singleton
export const evaluationService = new EvaluationService();

// Export par défaut
export default evaluationService;
