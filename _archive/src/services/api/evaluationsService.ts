
import { v4 as uuidv4 } from 'uuid';
import { Evaluation, ComplianceStatus } from '@/lib/types';
import { handleDemoMode, baseService } from './baseService';
import { QueryFilters } from './types';

/**
 * Service pour gérer les évaluations
 */
class EvaluationsService {
  /**
   * Récupère toutes les évaluations
   */
  async getAll(filters?: QueryFilters): Promise<Evaluation[]> {
    try {
      const result = await baseService.getAll<Evaluation>('evaluations', filters);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      return [];
    }
  }

  /**
   * Récupère une évaluation par son ID
   */
  async getById(id: string): Promise<Evaluation | null> {
    try {
      const result = await baseService.getById<Evaluation>('evaluations', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'évaluation ${id}:`, error);
      return null;
    }
  }

  /**
   * Récupère les évaluations pour un audit
   */
  async getByAuditId(auditId: string): Promise<Evaluation[]> {
    try {
      const allEvaluations = await this.getAll();
      return allEvaluations.filter(evaluation => evaluation.auditId === auditId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des évaluations pour l'audit ${auditId}:`, error);
      return [];
    }
  }

  /**
   * Crée une nouvelle évaluation
   */
  async create(data: Partial<Evaluation>): Promise<Evaluation> {
    const newEvaluation: Evaluation = {
      id: uuidv4(),
      auditId: data.auditId || '',
      pageId: data.pageId || '',
      exigenceId: data.exigenceId || '',
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await baseService.create<Evaluation>('evaluations', newEvaluation);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      return newEvaluation;
    }
  }

  /**
   * Met à jour une évaluation
   */
  async update(id: string, data: Partial<Evaluation>): Promise<Evaluation> {
    try {
      const result = await baseService.update<Evaluation>('evaluations', id, data);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'évaluation ${id}:`, error);
      throw new Error(`Évaluation non trouvée: ${id}`);
    }
  }

  /**
   * Supprime une évaluation
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await baseService.delete('evaluations', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'évaluation ${id}:`, error);
      return false;
    }
  }
}

export const evaluationsService = new EvaluationsService();
