/**
 * Service pour la gestion des actions correctives
 */

import { notionClient } from '../notionClient';
import { generateMockActions } from './utils';
import { 
  CreateActionInput, 
  ActionResponse,
  ActionsResponse,
  ActionDeleteResponse,
  ProgressResponse,
  ProgressListResponse,
  ProgressDeleteResponse,
  CreateProgressInput
} from './types';
import { ComplianceStatus, ActionPriority, ActionStatus, CorrectiveAction, ActionProgress } from '@/types/domain';
import { getFutureDateString } from './utils';
import { progressService } from './progressService';

/**
 * Service de gestion des actions correctives
 */
class ActionService {
  /**
   * Récupère toutes les actions correctives liées à une évaluation
   */
  async getActions(evaluationId: string): Promise<ActionsResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: generateMockActions(evaluationId)
      };
    }
    
    // TODO: Implémenter la récupération des actions depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: generateMockActions(evaluationId)
    };
  }
  
  /**
   * Récupère une action corrective par son ID
   */
  async getActionById(id: string): Promise<ActionResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockActions = generateMockActions('mock-eval');
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
        dueDate: getFutureDateString(14), // dans 2 semaines
        responsible: 'John Doe',
        comment: "Ajouter des attributs alt à toutes les images",
        status: ActionStatus.InProgress
      }
    };
  }
  
  /**
   * Crée une nouvelle action corrective
   */
  async createAction(action: CreateActionInput): Promise<ActionResponse> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newAction = {
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
  async updateAction(action: CorrectiveAction): Promise<ActionResponse> {
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
  async deleteAction(_id: string): Promise<ActionDeleteResponse> {
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

  // Méthodes déléguées au progressService pour la gestion des suivis de progrès
  async getActionProgress(actionId: string): Promise<ProgressListResponse> {
    return progressService.getActionProgress(actionId);
  }

  async getActionProgressById(id: string): Promise<ProgressResponse> {
    return progressService.getActionProgressById(id);
  }

  async createActionProgress(progress: CreateProgressInput): Promise<ProgressResponse> {
    return progressService.createActionProgress(progress);
  }

  async updateActionProgress(progress: ActionProgress): Promise<ProgressResponse> {
    return progressService.updateActionProgress(progress);
  }

  async deleteActionProgress(id: string): Promise<ProgressDeleteResponse> {
    return progressService.deleteActionProgress(id);
  }
}

// Créer et exporter une instance singleton
export const actionService = new ActionService();

// Export par défaut
export default actionService;
