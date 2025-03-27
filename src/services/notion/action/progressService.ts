/**
 * Service pour la gestion des suivis de progrès
 */

import { notionClient } from '../notionClient';
import { generateMockActionProgress } from './utils';
import { 
  CreateProgressInput, 
  ProgressResponse, 
  ProgressListResponse,
  ProgressDeleteResponse
} from './types';
import { 
  ComplianceStatus, 
  ActionStatus, 
  ActionProgress,
  complianceStatusToLevel,
  actionStatusToType
} from '@/types/domain';

/**
 * Service de gestion des suivis de progrès
 */
class ProgressService {
  /**
   * Récupère tous les suivis de progrès liés à une action corrective
   */
  async getActionProgress(actionId: string): Promise<ProgressListResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: generateMockActionProgress(actionId)
      };
    }
    
    // TODO: Implémenter la récupération des suivis de progrès depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: generateMockActionProgress(actionId)
    };
  }
  
  /**
   * Récupère un suivi de progrès par son ID
   */
  async getActionProgressById(id: string): Promise<ProgressResponse> {
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockProgress = generateMockActionProgress('mock-action');
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
        score: complianceStatusToLevel[ComplianceStatus.PartiallyCompliant],
        status: actionStatusToType[ActionStatus.InProgress]
      }
    };
  }
  
  /**
   * Crée un nouveau suivi de progrès
   */
  async createActionProgress(progress: CreateProgressInput): Promise<ProgressResponse> {
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newProgress = {
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
  async updateActionProgress(progress: ActionProgress): Promise<ProgressResponse> {
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
  async deleteActionProgress(_id: string): Promise<ProgressDeleteResponse> {
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
}

// Créer et exporter une instance singleton
export const progressService = new ProgressService();

// Export par défaut
export default progressService;
