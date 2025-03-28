
/**
 * Implémentation standardisée du service d'évaluations
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationData, UpdateEvaluationData } from './types';
import { generateMockId } from '../base/utils';

/**
 * Implémentation standardisée du service d'évaluations
 */
export class EvaluationServiceImpl extends BaseNotionService<Evaluation, CreateEvaluationData, UpdateEvaluationData> {
  constructor() {
    super('Evaluation', 'evaluationsDbId');
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
        score: 'conformant',
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
        score: 'non_conformant',
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
  protected async mockCreate(data: CreateEvaluationData): Promise<Evaluation> {
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
  protected async mockUpdate(entity: UpdateEvaluationData): Promise<Evaluation> {
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
  protected async getByIdImpl(id: string): Promise<NotionResponse<Evaluation>> {
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
  protected async createImpl(data: CreateEvaluationData): Promise<NotionResponse<Evaluation>> {
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
  protected async updateImpl(entity: UpdateEvaluationData): Promise<NotionResponse<Evaluation>> {
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
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
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

