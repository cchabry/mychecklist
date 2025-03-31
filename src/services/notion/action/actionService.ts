
import { CorrectiveAction, ActionPriority, ActionStatus } from '@/types/domain/action';
import { ComplianceStatus } from '@/types/domain/evaluation';
import { progressService } from './progressService';

/**
 * Service pour gérer les actions correctives
 */
export const actionService = {
  /**
   * Récupère les actions correctives pour une évaluation
   */
  async getActionsByEvaluation(evaluationId: string): Promise<CorrectiveAction[]> {
    // En mode démo, on renvoie des données simulées
    return [
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
  },

  /**
   * Récupère toutes les actions correctives pour un projet
   */
  async getActionsByProject(projectId: string): Promise<CorrectiveAction[]> {
    // En mode démo, on renvoie des données simulées
    return [
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
  },

  /**
   * Crée une nouvelle action corrective
   */
  async createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CorrectiveAction> {
    const newAction: CorrectiveAction = {
      ...action,
      id: `action-${action.evaluationId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // En mode démo, on simule la création et on retourne directement l'objet
    return newAction;
  },

  /**
   * Met à jour une action corrective existante
   */
  async updateAction(
    id: string,
    updates: Partial<Omit<CorrectiveAction, 'id' | 'evaluationId' | 'createdAt'>>
  ): Promise<CorrectiveAction> {
    // Simuler la récupération de l'action existante
    const action = await this.getAction(id);
    
    if (!action) {
      throw new Error(`Action ${id} not found`);
    }
    
    // Mise à jour des champs
    const updatedAction: CorrectiveAction = {
      ...action,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // En mode démo, on simule la mise à jour et on retourne directement l'objet
    return updatedAction;
  },

  /**
   * Récupère une action spécifique
   */
  async getAction(id: string): Promise<CorrectiveAction | null> {
    // En mode démo, on génère une action fictive
    return {
      id,
      evaluationId: `eval-${id.split('-')[1]}-1`,
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
  async deleteAction(id: string): Promise<boolean> {
    // En mode démo, on simule la suppression avec succès
    return true;
  },

  /**
   * Récupère l'historique de progression pour une action
   */
  async getActionProgress(id: string) {
    return progressService.getProgressUpdates(id);
  },

  /**
   * Ajoute une mise à jour de progression à une action
   */
  async addActionProgress(actionId: string, data: any) {
    return progressService.addProgressUpdate(actionId, data);
  }
};
