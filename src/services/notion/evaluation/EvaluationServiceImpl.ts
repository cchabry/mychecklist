
/**
 * Implémentation standardisée du service d'évaluations
 * basée sur la classe BaseNotionService
 */

import { BaseNotionService } from '../base';
import { NotionResponse } from '../types';
import { Evaluation } from '@/types/domain';
import { CreateEvaluationInput, UpdateEvaluationInput } from './types';
import { StandardFilterOptions } from '../base/types';
import { ComplianceLevel } from '@/types/enums';

// Fonctions de mock
function mockGetEvaluations(): Evaluation[] {
  return [
    {
      id: 'eval-1',
      auditId: 'audit-1',
      pageId: 'page-1',
      exigenceId: 'exigence-1',
      score: ComplianceLevel.Compliant,
      comment: 'Conforme aux exigences',
      attachments: [
        {
          id: 'attach-1',
          fileName: 'capture1.png',
          name: 'capture1.png',
          url: 'https://example.com/files/capture1.png',
          contentType: 'image/png',
          size: 1024,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'eval-2',
      auditId: 'audit-1',
      pageId: 'page-2',
      exigenceId: 'exigence-1',
      score: ComplianceLevel.PartiallyCompliant,
      comment: 'Partiellement conforme',
      attachments: [
        {
          id: 'attach-2',
          fileName: 'capture2.png',
          name: 'capture2.png',
          url: 'https://example.com/files/capture2.png',
          contentType: 'image/png',
          size: 2048,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function mockGetEvaluationById(id: string): Evaluation | undefined {
  return mockGetEvaluations().find(evaluation => evaluation.id === id);
}

function mockCreateEvaluation(data: CreateEvaluationInput): Evaluation {
  const newEvaluation: Evaluation = {
    id: `eval-${Date.now()}`,
    auditId: data.auditId,
    pageId: data.pageId,
    exigenceId: data.exigenceId,
    score: data.score,
    comment: data.comment,
    attachments: data.attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return newEvaluation;
}

function mockUpdateEvaluation(entity: UpdateEvaluationInput): Evaluation {
  const existingEvaluation = mockGetEvaluationById(entity.id);
  if (!existingEvaluation) {
    throw new Error(`Evaluation non trouvée: ${entity.id}`);
  }

  const updatedEvaluation: Evaluation = {
    ...existingEvaluation,
    score: entity.score !== undefined ? entity.score : existingEvaluation.score,
    comment: entity.comment !== undefined ? entity.comment : existingEvaluation.comment,
    attachments: entity.attachments !== undefined ? entity.attachments : existingEvaluation.attachments,
    updatedAt: new Date().toISOString()
  };
  return updatedEvaluation;
}

function mockDeleteEvaluation(id: string): boolean {
  const evaluationExists = mockGetEvaluationById(id) !== undefined;
  return evaluationExists;
}

/**
 * Implémentation standardisée du service d'évaluations
 */
export class EvaluationServiceImpl extends BaseNotionService<Evaluation, CreateEvaluationInput, UpdateEvaluationInput> {
  constructor() {
    super('Evaluation', 'evaluationsDbId');
  }
  
  /**
   * Génère des évaluations fictives pour le mode mock
   */
  protected async getMockEntities(): Promise<Evaluation[]> {
    return mockGetEvaluations();
  }
  
  /**
   * Crée une évaluation fictive en mode mock
   */
  protected async mockCreate(data: CreateEvaluationInput): Promise<Evaluation> {
    return mockCreateEvaluation(data);
  }
  
  /**
   * Met à jour une évaluation fictive en mode mock
   */
  protected async mockUpdate(entity: UpdateEvaluationInput): Promise<Evaluation> {
    return mockUpdateEvaluation(entity);
  }
  
  /**
   * Supprime une évaluation fictive en mode mock
   */
  protected async mockDelete(id: string): Promise<boolean> {
    return Promise.resolve(mockDeleteEvaluation(id));
  }

  /**
   * Implémentation de la récupération des évaluations
   */
  protected async getAllImpl(_options?: StandardFilterOptions<Evaluation>): Promise<NotionResponse<Evaluation[]>> {
    // Implémentation non disponible pour le moment
    return Promise.resolve({ success: false, error: { message: 'Non implémenté' } });
  }

  /**
   * Implémentation de la récupération d'une évaluation par son ID
   */
  protected async getByIdImpl(_id: string): Promise<NotionResponse<Evaluation>> {
    // Implémentation non disponible pour le moment
    return Promise.resolve({ success: false, error: { message: 'Non implémenté' } });
  }

  /**
   * Implémentation de la création d'une évaluation
   */
  protected async createImpl(_data: CreateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    // Implémentation non disponible pour le moment
    return Promise.resolve({ success: false, error: { message: 'Non implémenté' } });
  }

  /**
   * Implémentation de la mise à jour d'une évaluation
   */
  protected async updateImpl(_entity: UpdateEvaluationInput): Promise<NotionResponse<Evaluation>> {
    // Implémentation non disponible pour le moment
    return Promise.resolve({ success: false, error: { message: 'Non implémenté' } });
  }

  /**
   * Implémentation de la suppression d'une évaluation
   */
  protected async deleteImpl(_id: string): Promise<NotionResponse<boolean>> {
    // Implémentation non disponible pour le moment
    return Promise.resolve({ success: false, error: { message: 'Non implémenté' } });
  }

  /**
   * Méthode auxiliaire pour récupérer les évaluations d'un audit spécifique
   */
  async getEvaluationsByAudit(auditId: string, pageId?: string, exigenceId?: string): Promise<NotionResponse<Evaluation[]>> {
    // Simuler une réponse réussie avec des données mock
    const evaluations = mockGetEvaluations().filter(e => e.auditId === auditId);

    if (pageId) {
      evaluations.filter(e => e.pageId === pageId);
    }

    if (exigenceId) {
      evaluations.filter(e => e.exigenceId === exigenceId);
    }

    return Promise.resolve({ success: true, data: evaluations });
  }
}

// Créer et exporter une instance singleton
export const evaluationServiceImpl = new EvaluationServiceImpl();

// Export par défaut
export default evaluationServiceImpl;
