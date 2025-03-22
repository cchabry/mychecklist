
import { ChecklistItem } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des items de checklist
 */
export class ChecklistService extends BaseService<ChecklistItem> {
  constructor() {
    super('checklist', {
      cacheTTL: 30 * 60 * 1000, // 30 minutes (moins fréquemment mis à jour)
    });
  }
  
  /**
   * Récupère un item de checklist par son ID
   */
  protected async fetchById(id: string): Promise<ChecklistItem | null> {
    try {
      return await notionApi.getChecklistItem(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'item de checklist #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère tous les items de checklist
   */
  protected async fetchAll(filters?: QueryFilters): Promise<ChecklistItem[]> {
    try {
      const items = await notionApi.getChecklistItems();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(items, filters);
      }
      
      return items;
    } catch (error) {
      console.error('Erreur lors de la récupération des items de checklist:', error);
      return [];
    }
  }
  
  /**
   * Crée un nouvel item de checklist
   */
  protected async createItem(data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    if (!data.consigne) {
      throw new Error('La consigne est requise');
    }
    
    return await notionApi.createChecklistItem({
      consigne: data.consigne,
      description: data.description || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      ...data
    });
  }
  
  /**
   * Met à jour un item de checklist existant
   */
  protected async updateItem(id: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const existingItem = await this.fetchById(id);
    
    if (!existingItem) {
      throw new Error(`Item de checklist #${id} non trouvé`);
    }
    
    return await notionApi.updateChecklistItem(id, {
      ...existingItem,
      ...data,
      id // S'assurer que l'ID reste inchangé
    });
  }
  
  /**
   * Supprime un item de checklist
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteChecklistItem(id);
  }
  
  /**
   * Récupère les items de checklist par catégorie
   */
  async getByCategory(category: string): Promise<ChecklistItem[]> {
    return this.getAll(undefined, { category });
  }
  
  /**
   * Récupère les catégories distinctes
   */
  async getCategories(): Promise<string[]> {
    const items = await this.getAll();
    const categories = new Set<string>();
    
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    return Array.from(categories).sort();
  }
  
  /**
   * Récupère les sous-catégories distinctes pour une catégorie
   */
  async getSubcategories(category?: string): Promise<string[]> {
    const items = category ? await this.getByCategory(category) : await this.getAll();
    const subcategories = new Set<string>();
    
    items.forEach(item => {
      if (item.subcategory) {
        subcategories.add(item.subcategory);
      }
    });
    
    return Array.from(subcategories).sort();
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux items de checklist
   */
  private applyFilters(items: ChecklistItem[], filters: QueryFilters): ChecklistItem[] {
    return items.filter(item => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const itemValue = item[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        // Pour les références et autres tableaux dans l'item
        if (Array.isArray(itemValue) && typeof value === 'string') {
          return itemValue.includes(value);
        }
        
        return itemValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const checklistService = new ChecklistService();
