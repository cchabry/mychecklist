/**
 * Service pour la gestion des items de checklist via Notion
 * 
 * Ce service fournit les fonctionnalités nécessaires pour interagir avec
 * les données de checklist, soit via l'API Notion, soit en mode simulation.
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { ChecklistItem } from '@/types/domain';
import { generateMockChecklistItems } from './utils';
import { checklistMappers } from './checklistMappers';

/**
 * Service de gestion des items de checklist
 */
class ChecklistService {
  /**
   * Configure le service avec les paramètres nécessaires
   */
  constructor() {
    this.getChecklistItems = this.getChecklistItems.bind(this);
    this.getChecklistItemById = this.getChecklistItemById.bind(this);
  }
  
  /**
   * Vérifie si le service est en mode mock
   */
  isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Récupère la configuration du client Notion
   */
  getConfig() {
    return notionClient.getConfig();
  }
  
  /**
   * Récupère tous les items de checklist
   */
  async getChecklistItems(): Promise<NotionResponse<ChecklistItem[]>> {
    const config = this.getConfig();
    
    if (!config || !config.checklistsDbId) {
      return { 
        success: false, 
        error: { message: "Configuration ou ID de base de données de checklist non disponible" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (this.isMockMode()) {
      return {
        success: true,
        data: generateMockChecklistItems()
      };
    }
    
    // En mode réel, interroger l'API Notion
    try {
      const response = await notionClient.request({
        method: 'POST',
        path: `databases/${config.checklistsDbId}/query`,
        body: {}
      });
      
      const items = (response.results || []).map(page => this.notionPageToChecklistItem(page));
      
      return {
        success: true,
        data: items
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des items de checklist:", error);
      return {
        success: false,
        error: { 
          message: `Erreur lors de la récupération des items de checklist: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Récupère un item de checklist par son identifiant
   */
  async getChecklistItemById(itemId: string): Promise<NotionResponse<ChecklistItem>> {
    const config = this.getConfig();
    
    if (!config || !config.checklistsDbId) {
      return { 
        success: false, 
        error: { message: "Configuration ou ID de base de données de checklist non disponible" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (this.isMockMode()) {
      return this.getMockChecklistItemById(itemId);
    }
    
    // En mode réel, interroger l'API Notion
    try {
      const response = await notionClient.request({
        method: 'GET',
        path: `databases/${config.checklistsDbId}/query`,
        body: {
          filter: {
            property: 'ID',
            rich_text: {
              equals: itemId
            }
          }
        }
      });
      
      if (!response.results || response.results.length === 0) {
        return {
          success: false,
          error: { message: `Item de checklist #${itemId} non trouvé` }
        };
      }
      
      const page = response.results[0];
      const item = this.notionPageToChecklistItem(page);
      
      return {
        success: true,
        data: item
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'item de checklist #${itemId}:`, error);
      return {
        success: false,
        error: { 
          message: `Erreur lors de la récupération de l'item de checklist: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Simule la récupération d'un item de checklist par son ID en mode mock
   */
  private getMockChecklistItemById(itemId: string): NotionResponse<ChecklistItem> {
    if (itemId === 'item-1') {
      return {
        success: true,
        data: checklistMappers.createMockChecklistItem(itemId)
      };
    }
    
    return {
      success: false,
      error: { message: `Item de checklist #${itemId} non trouvé en mode mock` }
    };
  }
  
  /**
   * Convertit une page Notion en un objet ChecklistItem
   */
  private notionPageToChecklistItem(page: any): ChecklistItem {
    return checklistMappers.notionPageToChecklistItem(page);
  }
}

// Créer et exporter une instance singleton
export const checklistService = new ChecklistService();

// Export par défaut
export default checklistService;
