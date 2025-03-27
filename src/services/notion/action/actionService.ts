
/**
 * Service pour la gestion des actions correctives
 */

import { notionClient } from '../notionClient';
import { generateMockActions } from './utils';
import { progressService } from './progressService';
import { actionMappers } from './actionMappers';
import { 
  CreateActionInput, 
  ActionResponse, 
  ActionListResponse,
  ActionDeleteResponse
} from './types';
import { CorrectiveAction } from '@/types/domain';

/**
 * Service de gestion des actions correctives
 */
class ActionService {
  /**
   * Récupère toutes les actions liées à une évaluation
   */
  async getActions(evaluationId: string): Promise<ActionListResponse> {
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
   * Récupère une action par son ID
   */
  async getActionById(id: string): Promise<ActionResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockActions = generateMockActions('mock-evaluation');
      const action = mockActions.find(a => a.id === id);
      
      if (!action) {
        return { 
          success: false, 
          error: { message: `Action #${id} non trouvée` } 
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
      data: actionMappers.createMockAction(id)
    };
  }
  
  /**
   * Crée une nouvelle action corrective
   */
  async createAction(action: CreateActionInput): Promise<ActionResponse> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newAction = actionMappers.mapInputToAction(action);
      
      return {
        success: true,
        data: newAction
      };
    }
    
    // TODO: Implémenter la création d'une action dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: actionMappers.mapInputToAction(action)
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
  getActionProgress = progressService.getActionProgress.bind(progressService);
  getActionProgressById = progressService.getActionProgressById.bind(progressService);
  createActionProgress = progressService.createActionProgress.bind(progressService);
  updateActionProgress = progressService.updateActionProgress.bind(progressService);
  deleteActionProgress = progressService.deleteActionProgress.bind(progressService);
}

// Créer et exporter une instance singleton
export const actionService = new ActionService();

// Export par défaut
export default actionService;
