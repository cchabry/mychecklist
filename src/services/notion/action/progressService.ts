
/**
 * Service pour la gestion des progrès d'actions correctives via Notion
 * 
 * Ce service fournit les fonctionnalités nécessaires pour interagir avec
 * les données de suivi de progrès, soit via l'API Notion, soit en mode simulation.
 */

import { notionClient } from '../notionClient';
import { NotionResponse } from '../types';
import { ActionProgress } from '@/types/domain';
import { generateMockProgress } from './utils';
import { progressMappers } from './progressMappers';
import { CreateProgressInput } from './types';

/**
 * Service de gestion des progrès d'actions correctives
 */
class ProgressService {
  /**
   * Récupère tous les progrès liés à une action
   */
  async getActionProgress(actionId: string): Promise<NotionResponse<ActionProgress[]>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: generateMockProgress(actionId)
      };
    }
    
    // TODO: Implémenter la récupération des progrès depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: generateMockProgress(actionId)
    };
  }
  
  /**
   * Récupère un progrès par son ID
   */
  async getActionProgressById(id: string): Promise<NotionResponse<ActionProgress>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      const mockProgress = generateMockProgress('mock-action');
      const progress = mockProgress.find(p => p.id === id);
      
      if (!progress) {
        return { 
          success: false, 
          error: { message: `Progrès #${id} non trouvé` } 
        };
      }
      
      return {
        success: true,
        data: progress
      };
    }
    
    // TODO: Implémenter la récupération d'un progrès depuis Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: progressMappers.createMockProgress(id)
    };
  }
  
  /**
   * Crée un nouveau progrès d'action
   */
  async createActionProgress(progress: CreateProgressInput): Promise<NotionResponse<ActionProgress>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newProgress = progressMappers.mapInputToProgress(progress);
      
      return {
        success: true,
        data: newProgress
      };
    }
    
    // TODO: Implémenter la création d'un progrès dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: progressMappers.mapInputToProgress(progress)
    };
  }
  
  /**
   * Met à jour un progrès d'action existant
   */
  async updateActionProgress(progress: ActionProgress): Promise<NotionResponse<ActionProgress>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: progress
      };
    }
    
    // TODO: Implémenter la mise à jour d'un progrès dans Notion
    // Pour l'instant, renvoyer des données simulées même en mode réel
    return {
      success: true,
      data: progress
    };
  }
  
  /**
   * Supprime un progrès d'action
   */
  async deleteActionProgress(_id: string): Promise<NotionResponse<boolean>> {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'un progrès dans Notion
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
