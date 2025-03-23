
import { v4 as uuidv4 } from 'uuid';
import { Evaluation } from '@/lib/types';
import { mockData } from '@/lib/mockData';
import { createBaseService } from './baseService';
import { QueryFilters } from './types';

const initialEvaluations = mockData.evaluations || [];

/**
 * Service pour gérer les évaluations
 */
class EvaluationsService {
  private evaluations: Evaluation[] = [...initialEvaluations];
  private baseService = createBaseService<Evaluation>('evaluations');

  /**
   * Récupère toutes les évaluations
   */
  async getAll(filters?: QueryFilters): Promise<Evaluation[]> {
    try {
      const result = await this.baseService.getAll(filters);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      return this.evaluations;
    }
  }

  /**
   * Récupère une évaluation par son ID
   */
  async getById(id: string): Promise<Evaluation | null> {
    try {
      const result = await this.baseService.getById(id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'évaluation ${id}:`, error);
      const evaluation = this.evaluations.find(e => e.id === id) || null;
      return evaluation;
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
      return this.evaluations.filter(evaluation => evaluation.auditId === auditId);
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
      score: data.score || 'Non évalué',
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await this.baseService.create(newEvaluation);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      this.evaluations.push(newEvaluation);
      return newEvaluation;
    }
  }

  /**
   * Met à jour une évaluation
   */
  async update(id: string, data: Partial<Evaluation>): Promise<Evaluation> {
    try {
      const result = await this.baseService.update(id, data);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'évaluation ${id}:`, error);
      
      const index = this.evaluations.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Évaluation non trouvée: ${id}`);
      }
      
      const updatedEvaluation = {
        ...this.evaluations[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      this.evaluations[index] = updatedEvaluation;
      return updatedEvaluation;
    }
  }

  /**
   * Supprime une évaluation
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.baseService.delete(id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'évaluation ${id}:`, error);
      
      const index = this.evaluations.findIndex(e => e.id === id);
      if (index === -1) {
        return false;
      }
      
      this.evaluations.splice(index, 1);
      return true;
    }
  }
}

export const evaluationsService = new EvaluationsService();
