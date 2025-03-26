
/**
 * Service pour la gestion des actions correctives via Notion
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { CorrectiveAction, ActionProgress, ComplianceStatus, ActionPriority, ActionStatus } from '@/types/domain';

/**
 * Service de gestion des actions correctives
 */
class ActionService {
  /**
   * Récupère toutes les actions correctives liées à une évaluation
   */
  async getActions(evaluationId: string): Promise<NotionResponse<CorrectiveAction[]>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockActions(evaluationId)
      };
    }
    
    // TODO: Implémenter la récupération des actions depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: this.getMockActions(evaluationId)
    };
  }
  
  /**
   * Récupère une action corrective par son ID
   */
  async getActionById(id: string): Promise<NotionResponse<CorrectiveAction>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockActions = this.getMockActions('mock-eval');
      const action = mockActions.find(a => a.id === id);
      
      if (!action) {
        return { 
          success: false, 
          error: { message: `Action corrective #${id} non trouvée` } 
        };
      }
      
      return {
        success: true,
        data: action
      };
    }
    
    // TODO: Implémenter la récupération d'une action depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        id,
        evaluationId: 'mock-eval',
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.High,
        dueDate: this.getFutureDateString(14), // dans 2 semaines
        responsible: 'John Doe',
        comment: "Ajouter des attributs alt à toutes les images",
        status: ActionStatus.InProgress
      }
    };
  }
  
  /**
   * Crée une nouvelle action corrective
   */
  async createAction(action: Omit<CorrectiveAction, 'id'>): Promise<NotionResponse<CorrectiveAction>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newAction: CorrectiveAction = {
        ...action,
        id: `action-${Date.now()}`
      };
      
      return {
        success: true,
        data: newAction
      };
    }
    
    // TODO: Implémenter la création d'une action dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...action,
        id: `action-${Date.now()}`
      }
    };
  }
  
  /**
   * Met à jour une action corrective existante
   */
  async updateAction(action: CorrectiveAction): Promise<NotionResponse<CorrectiveAction>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: action
      };
    }
    
    // TODO: Implémenter la mise à jour d'une action dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: action
    };
  }
  
  /**
   * Supprime une action corrective
   */
  async deleteAction(_id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'une action dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Récupère tous les suivis de progrès liés à une action corrective
   */
  async getActionProgress(actionId: string): Promise<NotionResponse<ActionProgress[]>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: this.getMockActionProgress(actionId)
      };
    }
    
    // TODO: Implémenter la récupération des suivis de progrès depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: this.getMockActionProgress(actionId)
    };
  }
  
  /**
   * Récupère un suivi de progrès par son ID
   */
  async getActionProgressById(id: string): Promise<NotionResponse<ActionProgress>> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockProgress = this.getMockActionProgress('mock-action');
      const progress = mockProgress.find(p => p.id === id);
      
      if (!progress) {
        return { 
          success: false, 
          error: { message: `Suivi de progrès #${id} non trouvé` } 
        };
      }
      
      return {
        success: true,
        data: progress
      };
    }
    
    // TODO: Implémenter la récupération d'un suivi de progrès depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        id,
        actionId: 'mock-action',
        date: new Date().toISOString(),
        responsible: 'Jane Smith',
        comment: "Première phase des corrections effectuée",
        score: ComplianceStatus.PartiallyCompliant,
        status: ActionStatus.InProgress
      }
    };
  }
  
  /**
   * Crée un nouveau suivi de progrès
   */
  async createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<NotionResponse<ActionProgress>> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newProgress: ActionProgress = {
        ...progress,
        id: `progress-${Date.now()}`
      };
      
      return {
        success: true,
        data: newProgress
      };
    }
    
    // TODO: Implémenter la création d'un suivi de progrès dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: {
        ...progress,
        id: `progress-${Date.now()}`
      }
    };
  }
  
  /**
   * Met à jour un suivi de progrès existant
   */
  async updateActionProgress(progress: ActionProgress): Promise<NotionResponse<ActionProgress>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: progress
      };
    }
    
    // TODO: Implémenter la mise à jour d'un suivi de progrès dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: progress
    };
  }
  
  /**
   * Supprime un suivi de progrès
   */
  async deleteActionProgress(_id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'un suivi de progrès dans Notion
    // Pour l'instant, simuler le succès même en mode réel
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Génère des actions correctives fictives pour le mode démo
   */
  private getMockActions(evaluationId: string): CorrectiveAction[] {
    return [
      {
        id: 'action-1',
        evaluationId,
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.High,
        dueDate: this.getFutureDateString(7), // dans 1 semaine
        responsible: 'John Doe',
        comment: "Ajouter des attributs alt à toutes les images",
        status: ActionStatus.InProgress
      },
      {
        id: 'action-2',
        evaluationId,
        targetScore: ComplianceStatus.Compliant,
        priority: ActionPriority.Medium,
        dueDate: this.getFutureDateString(14), // dans 2 semaines
        responsible: 'Jane Smith',
        comment: "Optimiser les images pour le web",
        status: ActionStatus.Todo
      }
    ];
  }
  
  /**
   * Génère des suivis de progrès fictifs pour le mode démo
   */
  private getMockActionProgress(actionId: string): ActionProgress[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return [
      {
        id: 'progress-1',
        actionId,
        date: lastWeek.toISOString(),
        responsible: 'John Doe',
        comment: "Début des corrections",
        score: ComplianceStatus.PartiallyCompliant,
        status: ActionStatus.InProgress
      },
      {
        id: 'progress-2',
        actionId,
        date: yesterday.toISOString(),
        responsible: 'John Doe',
        comment: "50% des images corrigées",
        score: ComplianceStatus.PartiallyCompliant,
        status: ActionStatus.InProgress
      }
    ];
  }
  
  /**
   * Utilitaire pour générer une date future au format ISO
   */
  private getFutureDateString(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }
}

// Créer et exporter une instance singleton
export const actionService = new ActionService();

// Export par défaut
export default actionService;
