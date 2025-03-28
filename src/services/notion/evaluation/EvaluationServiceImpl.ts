
/**
 * Implémentation standardisée du service d'évaluations
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput, UpdateEvaluationInput } from './types';
import { generateMockId } from '../base/utils';
import { ComplianceLevel } from '@/types/enums';

/**
 * Implémentation standardisée du service d'évaluations
 */
export class EvaluationServiceImpl extends BaseNotionService<Evaluation, CreateEvaluationInput, UpdateEvaluationInput> {
  constructor() {
    super('Evaluation', 'evaluationsDbId');
  }

  /**
   * Récupère les évaluations d'un audit, filtrables par page et exigence
   */
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    return this.getAll({
      filter: (evaluation) => {
        return evaluation.auditId === auditId && 
          (!pageId || evaluation.pageId === pageId) &&
          (!exigenceId || evaluation.exigenceId === exigenceId);
      }
    });
  }

  /**
   * Génère des évaluations fictives pour le mode mock
   */
  protected async getMockEntities(): Promise<Evaluation[]> {
    const now = new Date().toISOString();
    return [
      {
        id: 'eval_1',
        auditId: 'audit_1',
        pageId: 'page_1',
        exigenceId: 'exigence_1',
        score: ComplianceLevel.Compliant,
        comment: 'Conforme aux exigences',
        attachments: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'eval_2',
        auditId: 'audit_1',
        pageId: 'page_2',
        exigenceId: 'exigence_2',
        score: ComplianceLevel.NonCompliant,
        comment: 'Ne respecte pas les exigences',
        attachments: [],
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  /**
   * Crée une évaluation fictive en mode mock
   */
  protected async mockCreate(data: CreateEvaluationInput): Promise<Evaluation> {
    const now = new Date().toISOString();
    return {
      id: generateMockId('eval'),
      auditId: data.auditId,
      pageId: data.pageId,
      exigenceId: data.exigenceId,
      score: data.score,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Met à jour une évaluation fictive en mode mock
   */
  protected async mockUpdate(entity: UpdateEvaluationInput): Promise<Evaluation> {
    const mockEvaluations = await this.getMockEntities();
    const existingEvaluation = mockEvaluations.find(e => e.id === entity.id);
    
    if (!existingEvaluation) {
      throw new Error(`Evaluation #${entity.id} non trouvée`);
    }
    
    return {
      ...existingEvaluation,
      score: entity.score !== undefined ? entity.score : existingEvaluation.score,
      comment: entity.comment !== undefined ? entity.comment : existingEvaluation.comment,
      attachments: entity.attachments !== undefined ? entity.attachments : existingEvaluation.attachments,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Implémentation de la récupération des évaluations
   */
  protected async getAllImpl(): Promise<NotionResponse<Evaluation[]>> {
    return {
      success: false,
      error: {
        message: "Non implémenté - Utilisez getEvaluationsByAudit"
      }
    };
  }

  /**
   * Implémentation de la récupération d'une évaluation par son ID
   */
  protected async getByIdImpl(_id: string): Promise<NotionResponse<Evaluation>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }

  /**
   * Implémentation de la création d'une évaluation
   */
  protected async createImpl(_data: CreateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }

  /**
   * Implémentation de la mise à jour d'une évaluation
   */
  protected async updateImpl(_entity: UpdateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }

  /**
   * Implémentation de la suppression d'une évaluation
   */
  protected async deleteImpl(_id: string): Promise<NotionResponse<boolean>> {
    return {
      success: false,
      error: {
        message: "Non implémenté"
      }
    };
  }
}

// Créer et exporter une instance singleton
export const evaluationServiceImpl = new EvaluationServiceImpl();

// Export par défaut
export default evaluationServiceImpl;
