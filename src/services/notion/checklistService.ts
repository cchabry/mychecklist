
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
            consigne: 'Vérifier le SEO',
            name: 'Vérifier le SEO',
            description: 'Assurez-vous que le SEO est bien configuré',
            category: 'Technique',
            subcategory: 'SEO',
            reference: ['OPQUAST-123'],
            profil: ['Développeur', 'Product Owner'],
            phase: ['Conception', 'Développement'],
            effort: 2,
            priority: 3,
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'checklist-2',
            consigne: 'Tester la performance',
            name: 'Tester la performance',
            description: 'Effectuer des tests de performance du site',
            category: 'Technique',
            subcategory: 'Performance',
            reference: ['RGESN-45'],
            profil: ['Développeur', 'Testeur'],
            phase: ['Développement', 'Validation'],
            effort: 3,
            priority: 4,
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
          consigne: 'Vérifier le SEO',
          name: 'Vérifier le SEO',
          description: 'Assurez-vous que le SEO est bien configuré',
          category: 'Technique',
          subcategory: 'SEO',
          reference: ['OPQUAST-123'],
          profil: ['Développeur', 'Product Owner'],
          phase: ['Conception', 'Développement'],
          effort: 2,
          priority: 3,
          projectId: 'project-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'checklist-2',
          consigne: 'Tester la performance',
          name: 'Tester la performance',
          description: 'Effectuer des tests de performance du site',
          category: 'Technique',
          subcategory: 'Performance',
          reference: ['RGESN-45'],
          profil: ['Développeur', 'Testeur'],
          phase: ['Développement', 'Validation'],
          effort: 3,
          priority: 4,
          projectId: 'project-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }

  /**
   * Récupère un item de checklist par son ID
   */
  async getChecklistItemById(id: string): Promise<NotionResponse<ChecklistItem>> {
    // Si en mode démo, simuler la récupération
    if (notionClient.isMockMode()) {
      return {
        success: true,
        data: {
          id,
          consigne: 'Item de checklist simulé',
          name: 'Item simulé',
          description: 'Description simulée pour les tests',
          category: 'Catégorie test',
          subcategory: 'Sous-catégorie test',
          reference: ['REF-123'],
          profil: ['Testeur'],
          phase: ['Test'],
          effort: 1,
          priority: 2,
          projectId: 'project-mock',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    // TODO: Implémenter la récupération d'un item de checklist depuis Notion
    return {
      success: true,
      data: {
        id,
        consigne: 'Item de checklist simulé',
        name: 'Item simulé',
        description: 'Description simulée pour les tests',
        category: 'Catégorie test',
        subcategory: 'Sous-catégorie test',
        reference: ['REF-123'],
        profil: ['Testeur'],
        phase: ['Test'],
        effort: 1,
        priority: 2,
        projectId: 'project-mock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
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
        consigne: item.consigne || 'Nouveau item',
        name: item.name || 'Nouvel item',
        description: item.description || '',
        category: item.category || 'Non catégorisé',
        subcategory: item.subcategory || '',
        reference: item.reference || [],
        profil: item.profil || [],
        phase: item.phase || [],
        effort: item.effort || 1,
        priority: item.priority || 1,
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
      consigne: item.consigne || 'Nouveau item',
      name: item.name || 'Nouvel item',
      description: item.description || '',
      category: item.category || 'Non catégorisé',
      subcategory: item.subcategory || '',
      reference: item.reference || [],
      profil: item.profil || [],
      phase: item.phase || [],
      effort: item.effort || 1,
      priority: item.priority || 1,
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
