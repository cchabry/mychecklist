
import { v4 as uuidv4 } from 'uuid';
import { CorrectiveAction, ActionPriority, ActionStatus, ComplianceStatus } from '@/lib/types';
import { mockActions } from '@/lib/mockData';
import { baseService } from './baseService';
import { QueryFilters } from './types';

const initialActions = mockActions || [];

/**
 * Service pour gérer les actions correctives
 */
class ActionsService {
  private actions: CorrectiveAction[] = [...initialActions];

  /**
   * Récupère toutes les actions correctives
   */
  async getAll(filters?: QueryFilters): Promise<CorrectiveAction[]> {
    try {
      const result = await baseService.getAll<CorrectiveAction>('actions', filters);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des actions:', error);
      return this.actions;
    }
  }

  /**
   * Récupère une action corrective par son ID
   */
  async getById(id: string): Promise<CorrectiveAction | null> {
    try {
      const result = await baseService.getById<CorrectiveAction>('actions', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'action ${id}:`, error);
      const action = this.actions.find(a => a.id === id) || null;
      return action;
    }
  }

  /**
   * Récupère les actions correctives pour une évaluation
   */
  async getByEvaluationId(evaluationId: string): Promise<CorrectiveAction[]> {
    try {
      const allActions = await this.getAll();
      return allActions.filter(action => action.evaluationId === evaluationId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des actions pour l'évaluation ${evaluationId}:`, error);
      return this.actions.filter(action => action.evaluationId === evaluationId);
    }
  }

  /**
   * Crée une nouvelle action corrective
   */
  async create(data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const newAction: CorrectiveAction = {
      id: uuidv4(),
      evaluationId: data.evaluationId || '',
      pageId: data.pageId || '',
      targetScore: data.targetScore as ComplianceStatus || 'Conforme' as ComplianceStatus,
      priority: data.priority as ActionPriority || 'Faible' as ActionPriority,
      dueDate: data.dueDate || new Date().toISOString(),
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status as ActionStatus || 'À faire' as ActionStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const result = await baseService.create<CorrectiveAction>('actions', newAction);
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de l\'action:', error);
      this.actions.push(newAction);
      return newAction;
    }
  }

  /**
   * Met à jour une action corrective
   */
  async update(id: string, data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    try {
      const result = await baseService.update<CorrectiveAction>('actions', id, data);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'action ${id}:`, error);
      
      const index = this.actions.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error(`Action non trouvée: ${id}`);
      }
      
      const updatedAction = {
        ...this.actions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      this.actions[index] = updatedAction;
      return updatedAction;
    }
  }

  /**
   * Supprime une action corrective
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await baseService.delete('actions', id);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'action ${id}:`, error);
      
      const index = this.actions.findIndex(a => a.id === id);
      if (index === -1) {
        return false;
      }
      
      this.actions.splice(index, 1);
      return true;
    }
  }
}

export const actionsService = new ActionsService();
