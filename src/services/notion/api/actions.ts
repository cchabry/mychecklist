
/**
 * Implémentation de l'API des actions correctives et des progrès
 */

import { ActionApi } from '@/types/api/domain';
import { 
  CorrectiveAction, 
  ActionProgress
} from '@/types/domain';
import { actionService } from '../action';
import { CreateActionInput, CreateProgressInput } from '../action/types';

export class NotionActionApi implements ActionApi {
  // Actions correctives
  async getActions(evaluationId: string): Promise<CorrectiveAction[]> {
    const response = await actionService.getActions(evaluationId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des actions correctives");
    }
    return response.data || [];
  }
  
  async getActionById(id: string): Promise<CorrectiveAction> {
    const response = await actionService.getActionById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Action corrective #${id} non trouvée`);
    }
    return response.data as CorrectiveAction;
  }
  
  async createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CorrectiveAction> {
    // Pass the action properties directly to the service
    const actionInput: CreateActionInput = {
      evaluationId: action.evaluationId,
      targetScore: action.targetScore,
      priority: action.priority,
      dueDate: action.dueDate,
      responsible: action.responsible,
      comment: action.comment,
      status: action.status
    };
    
    const response = await actionService.createAction(actionInput);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'action corrective");
    }
    return response.data as CorrectiveAction;
  }
  
  async updateAction(action: CorrectiveAction): Promise<CorrectiveAction> {
    const response = await actionService.updateAction(action);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'action corrective");
    }
    return response.data as CorrectiveAction;
  }
  
  async deleteAction(id: string): Promise<boolean> {
    const response = await actionService.deleteAction(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'action corrective");
    }
    return true;
  }
  
  // Progrès d'actions
  async getActionProgress(actionId: string): Promise<ActionProgress[]> {
    const response = await actionService.getActionProgress(actionId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des suivis de progrès");
    }
    return response.data || [];
  }
  
  async getActionProgressById(id: string): Promise<ActionProgress> {
    const response = await actionService.getActionProgressById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Suivi de progrès #${id} non trouvé`);
    }
    return response.data as ActionProgress;
  }
  
  async createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress> {
    // Pass the progress properties directly to the service
    const progressInput: CreateProgressInput = {
      actionId: progress.actionId,
      date: progress.date,
      responsible: progress.responsible,
      comment: progress.comment,
      score: progress.score,
      status: progress.status
    };
    
    const response = await actionService.createActionProgress(progressInput);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création du suivi de progrès");
    }
    return response.data as ActionProgress;
  }
  
  async updateActionProgress(progress: ActionProgress): Promise<ActionProgress> {
    const response = await actionService.updateActionProgress(progress);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour du suivi de progrès");
    }
    return response.data as ActionProgress;
  }
  
  async deleteActionProgress(id: string): Promise<boolean> {
    const response = await actionService.deleteActionProgress(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression du suivi de progrès");
    }
    return true;
  }
}

export const actionsApi = new NotionActionApi();
