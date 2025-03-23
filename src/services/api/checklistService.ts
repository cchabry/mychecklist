
import { ChecklistItem } from '@/lib/types';
import { QueryFilters } from './types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class ChecklistService extends BaseServiceAbstract<ChecklistItem> {
  constructor() {
    super('checklist', {
      cacheTTL: 15 * 60 * 1000 // 15 minutes
    });
  }
  
  protected async fetchById(id: string): Promise<ChecklistItem | null> {
    if (operationMode.isDemoMode) {
      const mockChecklist = await import('@/lib/mockData').then(m => m.mockChecklist);
      return mockChecklist.find(item => item.id === id) || null;
    }
    
    try {
      const item = await notionApi.getChecklistItem(id);
      return item;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'item ${id}:`, error);
      throw error;
    }
  }
  
  protected async fetchAll(filters?: QueryFilters): Promise<ChecklistItem[]> {
    if (operationMode.isDemoMode) {
      const mockChecklist = await import('@/lib/mockData').then(m => m.mockChecklist);
      
      if (filters && filters.category) {
        return mockChecklist.filter(item => item.category === filters.category);
      }
      
      return mockChecklist;
    }
    
    try {
      const checklist = await notionApi.getChecklistItems(filters);
      return checklist;
    } catch (error) {
      console.error('Erreur lors de la récupération de la checklist:', error);
      throw error;
    }
  }
  
  protected async createItem(data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    if (operationMode.isDemoMode) {
      const newItem: ChecklistItem = {
        id: `item_${Date.now()}`,
        title: data.title || 'Nouvel item',
        description: data.description || '',
        category: data.category || 'Autres',
        subcategory: data.subcategory || '',
        references: data.references || [],
        profiles: data.profiles || [],
        phases: data.phases || [],
        effort: data.effort || 'medium',
        priority: data.priority || 'medium'
      };
      
      return newItem;
    }
    
    try {
      const item = await notionApi.createChecklistItem(data);
      return item;
    } catch (error) {
      console.error('Erreur lors de la création de l\'item:', error);
      throw error;
    }
  }
  
  protected async updateItem(id: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    if (operationMode.isDemoMode) {
      const mockChecklist = await import('@/lib/mockData').then(m => m.mockChecklist);
      const itemIndex = mockChecklist.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        throw new Error(`Item non trouvé: ${id}`);
      }
      
      const updatedItem: ChecklistItem = {
        ...mockChecklist[itemIndex],
        ...data
      };
      
      return updatedItem;
    }
    
    try {
      const item = await notionApi.updateChecklistItem(id, data);
      return item;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'item ${id}:`, error);
      throw error;
    }
  }
  
  protected async deleteItem(id: string): Promise<boolean> {
    if (operationMode.isDemoMode) {
      return true;
    }
    
    try {
      await notionApi.deleteChecklistItem(id);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'item ${id}:`, error);
      throw error;
    }
  }
  
  async getCategories(): Promise<string[]> {
    const items = await this.getAll();
    const categories = [...new Set(items.map(item => item.category))].sort();
    return categories;
  }
  
  async getCategoriesWithSubcategories(): Promise<Record<string, string[]>> {
    const items = await this.getAll();
    
    const result: Record<string, string[]> = {};
    
    items.forEach(item => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      
      if (item.subcategory && !result[item.category].includes(item.subcategory)) {
        result[item.category].push(item.subcategory);
      }
    });
    
    // Tri des sous-catégories
    Object.keys(result).forEach(category => {
      result[category].sort();
    });
    
    return result;
  }
}

export const checklistService = new ChecklistService();
