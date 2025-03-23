
import { v4 as uuidv4 } from 'uuid';
import { CorrectiveAction, ComplianceStatus, ActionPriority, ActionStatus } from '@/lib/types';
import { handleDemoMode, baseService } from './baseService';
import { QueryFilters } from './types';

/**
 * Service pour gérer les actions correctives
 */
class ActionsService {
  /**
   * Récupère toutes les actions
   */
  async getAll(filters?: QueryFilters): Promise<CorrectiveAction[]> {
    try {
      const result = await baseService.getAll<CorrectiveAction>('actions', filters);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des actions:', error);
      return [];
    }
  }

  /**
   * Récupère une action par son ID
   */
  async getById(id: string): Promise<CorrectiveAction | null> {
    try {
      const result = await baseService.getById<CorrectiveAction>('actions', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'action ${id}:`, error);
      return null;
    }
  }

  /**
   * Récupère les actions pour une évaluation
   */
  async getByEvaluationId(evaluationId: string): Promise<CorrectiveAction[]> {
    try {
      const allActions = await this.getAll();
      return allActions.filter(action => action.evaluationId === evaluationId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des actions pour l'évaluation ${evaluationId}:`, error);
      return [];
    }
  }

  /**
   * Crée une nouvelle action
   */
  async create(data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const newAction: CorrectiveAction = {
      id: uuidv4(),
      evaluationId: data.evaluationId || '',
      targetScore: data.targetScore || ComplianceStatus.Compliant,
      priority: data.priority || ActionPriority.Medium,
      dueDate: data.dueDate,
      responsible: data.responsible,
      comment: data.comment || '',
      status: data.status || ActionStatus.ToDo,
      pageId: data.pageId || '',
      progress: data.progress || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await baseService.create<CorrectiveAction>('actions', newAction);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de l\'action:', error);
      return newAction;
    }
  }

  /**
   * Met à jour une action
   */
  async update(id: string, data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    try {
      const result = await baseService.update<CorrectiveAction>('actions', id, data);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'action ${id}:`, error);
      throw new Error(`Action non trouvée: ${id}`);
    }
  }

  /**
   * Supprime une action
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await baseService.delete('actions', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'action ${id}:`, error);
      return false;
    }
  }
}

export const actionsService = new ActionsService();
