/**
 * Service pour la gestion des items de checklist
 */

import { notionClient } from './notionClient';
import { NotionResponse } from './types';
import { ChecklistItem } from '@/types/domain';

/**
 * Service pour la gestion des items de checklist
 */
class ChecklistService {
  /**
   * Récupère tous les items de la checklist
   */
  async getChecklistItems(): Promise<NotionResponse<ChecklistItem[]>> {
    const config = notionClient.getConfig();
    
    if (!config?.checklistsDbId) {
      return { 
        success: false, 
        error: { message: "Base de données de checklist non configurée" } 
      };
    }
    
    // Si en mode démo, renvoyer des données simulées
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: [
          {
            id: 'checklist-1',
            name: 'Vérifier le SEO',
            description: 'Assurez-vous que le SEO est bien configuré',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'checklist-2',
            name: 'Tester la performance',
            description: 'Effectuer des tests de performance du site',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }
    
    // TODO: Implémenter la récupération des items de checklist depuis Notion
    return {
      success: true,
      data: [
        {
          id: 'checklist-1',
          name: 'Vérifier le SEO',
          description: 'Assurez-vous que le SEO est bien configuré',
          projectId: 'project-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'checklist-2',
          name: 'Tester la performance',
          description: 'Effectuer des tests de performance du site',
          projectId: 'project-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }

  /**
   * Crée un nouvel item de checklist
   */
  async createChecklistItem(item: Partial<ChecklistItem>): Promise<NotionResponse<ChecklistItem>> {
    const config = notionClient.getConfig();
    
    if (!config?.checklistsDbId) {
      return { 
        success: false, 
        error: { message: "Base de données de checklist non configurée" } 
      };
    }
    
    // Si en mode démo, simuler la création
    if (notionClient.isMockMode()) {
      const newItem: ChecklistItem = {
        id: `checklist-${Date.now()}`,
        name: item.name || 'Nouvel item',
        description: item.description || '',
        projectId: item.projectId || 'mock-project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newItem
      };
    }
    
    // TODO: Implémenter la création d'un item de checklist dans Notion
    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}`,
      name: item.name || 'Nouvel item',
      description: item.description || '',
      projectId: item.projectId || 'mock-project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newItem
    };
  }
  
  /**
   * Met à jour un item de checklist existant
   */
  async updateChecklistItem(item: ChecklistItem): Promise<NotionResponse<ChecklistItem>> {
    // Si en mode démo, simuler la mise à jour
    if (notionClient.isMockMode()) {
      const updatedItem: ChecklistItem = {
        ...item,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: updatedItem
      };
    }
    
    // TODO: Implémenter la mise à jour d'un item de checklist dans Notion
    const updatedItem: ChecklistItem = {
      ...item,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedItem
    };
  }
  
  /**
   * Supprime un item de checklist
   */
  async deleteChecklistItem(id: string): Promise<NotionResponse<boolean>> {
    // Si en mode démo, simuler la suppression
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    // TODO: Implémenter la suppression d'un item de checklist dans Notion
    return {
      success: true,
      data: true
    };
  }
}

// Créer et exporter une instance singleton
export const checklistService = new ChecklistService();

// Export par défaut
export default checklistService;
