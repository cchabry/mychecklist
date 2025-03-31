
import { CorrectiveAction, ActionPriority, ActionStatus } from '@/types/domain/action';
import { ComplianceStatus } from '@/types/domain/evaluation';
import { NotionResponse } from '../types';
import { progressService } from './progressService';
import { ActionProgress } from '@/types/domain/action';

/**
 * Service pour gérer les actions correctives
 */
export const actionService = {
  /**
   * Récupère les actions correctives pour une évaluation
   */
  async getActionsByEvaluation(evaluationId: string): Promise<NotionResponse<CorrectiveAction[]>> {
    // En mode démo, on renvoie des données simulées
    const actions = [
      {
        id: `action-${evaluationId}-1`,
        evaluationId,
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.High,
        status: ActionStatus.ToDo,
        comment: "Ajouter des balises alt à toutes les images",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: "Équipe SEO",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return {
      success: true,
      data: actions
    };
  },

  /**
   * Récupère toutes les actions correctives pour un projet
   */
  async getActionsByProject(projectId: string): Promise<NotionResponse<CorrectiveAction[]>> {
    // En mode démo, on renvoie des données simulées
    const actions = [
      {
        id: `action-${projectId}-1`,
        evaluationId: `eval-${projectId}-1`,
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.High,
        status: ActionStatus.ToDo,
        comment: "Ajouter des balises alt à toutes les images",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: "Équipe SEO",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `action-${projectId}-2`,
        evaluationId: `eval-${projectId}-2`,
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.Medium,
        status: ActionStatus.InProgress,
        comment: "Optimiser les temps de chargement des pages",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: "Équipe Performance",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return {
      success: true,
      data: actions
    };
  },

  /**
   * Crée une nouvelle action corrective
   */
  async createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotionResponse<CorrectiveAction>> {
    const newAction: CorrectiveAction = {
      ...action,
      id: `action-${action.evaluationId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // En mode démo, on simule la création et on retourne directement l'objet
    return {
      success: true,
      data: newAction
    };
  },

  /**
   * Met à jour une action corrective existante
   */
  async updateAction(
    actionId: string,
    updates: Partial<Omit<CorrectiveAction, 'id' | 'evaluationId' | 'createdAt'>>
  ): Promise<NotionResponse<CorrectiveAction>> {
    // Simuler la récupération de l'action existante
    const existingAction = await this.getAction(actionId);
    
    if (!existingAction) {
      return {
        success: false,
        error: { message: `Action ${actionId} not found` }
      };
    }
    
    // Mise à jour des champs
    const updatedAction: CorrectiveAction = {
      ...existingAction,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // En mode démo, on simule la mise à jour et on retourne directement l'objet
    return {
      success: true,
      data: updatedAction
    };
  },

  /**
   * Récupère une action spécifique
   */
  async getAction(actionId: string): Promise<CorrectiveAction | null> {
    // En mode démo, on génère une action fictive
    return {
      id: actionId,
      evaluationId: `eval-${actionId.split('-')[1]}-1`,
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.Medium,
      status: ActionStatus.InProgress,
      comment: "Action corrective exemplaire",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      responsible: "Équipe technique",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    };
  },

  /**
   * Supprime une action
   */
  async deleteAction(actionId: string): Promise<NotionResponse<boolean>> {
    // En mode démo, on simule la suppression avec succès
    return {
      success: true,
      data: true
    };
  },

  /**
   * Récupère l'historique de progression pour une action
   */
  async getActionProgress(_actionId: string): Promise<NotionResponse<ActionProgress[]>> {
    const progressUpdates = await progressService.getProgressUpdates(_actionId);
    return {
      success: true,
      data: progressUpdates
    };
  },

  /**
   * Ajoute une mise à jour de progression à une action
   */
  async addActionProgress(
    actionId: string, 
    data: Omit<ActionProgress, 'id' | 'actionId' | 'date'>
  ): Promise<NotionResponse<ActionProgress>> {
    const progressUpdate = await progressService.addProgressUpdate(actionId, data);
    return {
      success: true,
      data: progressUpdate
    };
  },
  
  /**
   * Récupère une progression spécifique
   */
  async getActionProgressById(progressId: string): Promise<NotionResponse<ActionProgress>> {
    // En mode démo, on génère une progression fictive
    return {
      success: true,
      data: {
        id: progressId,
        actionId: progressId.split('-')[1],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Mise à jour de la progression",
        author: "Jean Dupont",
        responsible: "Équipe technique",
        newStatus: ActionStatus.InProgress
      }
    };
  },
  
  /**
   * Crée une nouvelle progression
   */
  async createActionProgress(
    progress: Omit<ActionProgress, 'id'>
  ): Promise<NotionResponse<ActionProgress>> {
    // En mode démo, on simule la création et on retourne directement l'objet
    return {
      success: true,
      data: {
        ...progress,
        id: `progress-${progress.actionId}-${Date.now()}`
      }
    };
  },
  
  /**
   * Met à jour une progression
   */
  async updateActionProgress(
    progress: ActionProgress
  ): Promise<NotionResponse<ActionProgress>> {
    // En mode démo, on simule la mise à jour et on retourne directement l'objet
    return {
      success: true,
      data: progress
    };
  },
  
  /**
   * Supprime une progression
   */
  async deleteActionProgress(
    _id: string  // Paramètre renommé avec un underscore pour indiquer qu'il n'est pas utilisé
  ): Promise<NotionResponse<boolean>> {
    // En mode démo, on simule la suppression avec succès
    return {
      success: true,
      data: true
    };
  }
};
