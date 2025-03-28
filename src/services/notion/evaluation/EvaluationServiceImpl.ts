
/**
 * Implémentation standardisée du service d'évaluation
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService, generateMockId } from '../base/BaseNotionService';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { ComplianceLevel } from '@/types/enums';
import { CreateEvaluationInput } from './types';
import { generateMockEvaluations } from './utils';

/**
 * Implémentation standardisée du service d'évaluation
 */
export class EvaluationServiceImpl extends BaseNotionService<Evaluation, CreateEvaluationInput> {
  constructor() {
    super('Evaluation', 'evaluationsDbId');
  }
  
  /**
   * Récupère les évaluations correspondant aux critères fournis
   * 
   * @param auditId - Identifiant de l'audit
   * @param pageId - Identifiant de la page (optionnel)
   * @param exigenceId - Identifiant de l'exigence (optionnel)
   * @returns Réponse contenant les évaluations ou une erreur
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    return this.getAll({ auditId, pageId, exigenceId });
  }
  
  /**
   * Génère des évaluations fictives pour le mode mock
   */
  protected async getMockEntities(filter?: Record<string, any>): Promise<Evaluation[]> {
    const auditId = filter?.auditId || 'mock-audit';
    const pageId = filter?.pageId;
    const exigenceId = filter?.exigenceId;
    
    return generateMockEvaluations(auditId, pageId, exigenceId);
  }
  
  /**
   * Crée une évaluation fictive en mode mock
   */
  protected async mockCreate(data: CreateEvaluationInput): Promise<Evaluation> {
    const now = new Date().toISOString();
    return {
      ...data,
      id: generateMockId('eval'),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now
    };
  }
  
  /**
   * Met à jour une évaluation fictive en mode mock
   */
  protected async mockUpdate(entity: Evaluation): Promise<Evaluation> {
    return {
      ...entity,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Implémentation de la récupération des évaluations
   */
  protected async getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<Evaluation[]>> {
    const auditId = filter?.auditId;
    const pageId = filter?.pageId;
    const exigenceId = filter?.exigenceId;
    
    if (!auditId) {
      return {
        success: false,
        error: { message: "ID d'audit requis pour récupérer les évaluations" }
      };
    }
    
    try {
      // Pour l'instant, utilisons des données mock même en mode réel
      return {
        success: true,
        data: await this.getMockEntities(filter)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des évaluations: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la récupération d'une évaluation par son ID
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<Evaluation>> {
    try {
      // Pour l'instant, simulons avec des données mock
      const mockEvaluations = await this.getMockEntities();
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
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération de l'évaluation: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'une évaluation
   */
  protected async createImpl(data: CreateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    try {
      // Pour l'instant, utilisons une donnée mock
      return {
        success: true,
        data: await this.mockCreate(data)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création de l'évaluation: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'une évaluation
   */
  protected async updateImpl(entity: Evaluation): Promise<NotionResponse<Evaluation>> {
    try {
      // Pour l'instant, utilisons une donnée mock
      return {
        success: true,
        data: await this.mockUpdate(entity)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour de l'évaluation: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'une évaluation
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    try {
      // Utilisons l'ID dans l'implémentation pour éviter l'erreur TS6133
      console.log(`Suppression de l'évaluation avec l'ID: ${id}`);
      
      // Pour l'instant, simulons un succès
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression de l'évaluation: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
}

// Créer et exporter une instance singleton
export const evaluationServiceImpl = new EvaluationServiceImpl();

// Export par défaut
export default evaluationServiceImpl;
