
/**
 * Implémentation de l'API des actions correctives et des progrès
 */

import { ActionApi } from '@/types/api/domain';
import { 
  CorrectiveAction, 
  ActionProgress,
  ComplianceStatus,
  ActionPriority,
  ActionStatus,
  complianceStatusToLevel,
  actionPriorityToLevel,
  actionStatusToType
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
    // Conversion des types d'énumération en valeurs numériques pour le service
    const actionInput: CreateActionInput = {
      evaluationId: action.evaluationId,
      targetScore: this.getComplianceStatusFromLevel(action.targetScore),
      priority: this.getPriorityStatusFromLevel(action.priority),
      dueDate: action.dueDate,
      responsible: action.responsible,
      comment: action.comment,
      status: this.getActionStatusFromType(action.status)
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
    // Conversion des types d'énumération en valeurs numériques pour le service
    const progressInput: CreateProgressInput = {
      actionId: progress.actionId,
      date: progress.date,
      responsible: progress.responsible,
      comment: progress.comment,
      score: this.getComplianceStatusFromLevel(progress.score),
      status: this.getActionStatusFromType(progress.status)
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
  
  // Méthodes utilitaires pour la conversion entre types d'énumération et valeurs numériques
  private getComplianceStatusFromLevel(level: string): ComplianceStatus {
    const statusMap: Record<string, ComplianceStatus> = {
      [complianceStatusToLevel[ComplianceStatus.Compliant]]: ComplianceStatus.Compliant,
      [complianceStatusToLevel[ComplianceStatus.PartiallyCompliant]]: ComplianceStatus.PartiallyCompliant,
      [complianceStatusToLevel[ComplianceStatus.NonCompliant]]: ComplianceStatus.NonCompliant,
      [complianceStatusToLevel[ComplianceStatus.NotApplicable]]: ComplianceStatus.NotApplicable
    };
    return statusMap[level] ?? ComplianceStatus.NonCompliant;
  }
  
  private getPriorityStatusFromLevel(level: string): ActionPriority {
    const priorityMap: Record<string, ActionPriority> = {
      [actionPriorityToLevel[ActionPriority.Low]]: ActionPriority.Low,
      [actionPriorityToLevel[ActionPriority.Medium]]: ActionPriority.Medium,
      [actionPriorityToLevel[ActionPriority.High]]: ActionPriority.High,
      [actionPriorityToLevel[ActionPriority.Critical]]: ActionPriority.Critical
    };
    return priorityMap[level] ?? ActionPriority.Medium;
  }
  
  private getActionStatusFromType(type: string): ActionStatus {
    const statusMap: Record<string, ActionStatus> = {
      [actionStatusToType[ActionStatus.Todo]]: ActionStatus.Todo,
      [actionStatusToType[ActionStatus.InProgress]]: ActionStatus.InProgress,
      [actionStatusToType[ActionStatus.Done]]: ActionStatus.Done
    };
    return statusMap[type] ?? ActionStatus.Todo;
  }
}

export const actionsApi = new NotionActionApi();
