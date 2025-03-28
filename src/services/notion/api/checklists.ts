
/**
 * API pour les items de checklist
 */

import { BaseService } from '../core/BaseService';
import { ChecklistItem, ChecklistItemFilter } from '@/types/domain/checklist';

/**
 * Données pour la création d'un item de checklist
 */
export type CreateChecklistItemData = Omit<ChecklistItem, 'id'>;

/**
 * Données pour la mise à jour d'un item de checklist
 */
export type UpdateChecklistItemData = Partial<Omit<ChecklistItem, 'id'>>;

/**
 * Type pour les filtres standard
 */
export interface StandardFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Génère un ID fictif pour les mocks
 */
export function generateMockId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Service pour les items de checklist
 */
class ChecklistService extends BaseService<ChecklistItem, CreateChecklistItemData, UpdateChecklistItemData> {
  /**
   * Données mock pour les items de checklist
   */
  private mockItems: ChecklistItem[] = [
    {
      id: 'cl_001',
      title: 'Navigation au clavier',
      description: 'Tous les éléments interactifs doivent être accessibles au clavier',
      category: 'Accessibilité',
      subcategory: 'Navigation',
      reference: ['WCAG 2.1', 'RGAA 4.0'],
      profil: ['Développeur', 'Intégrateur'],
      phase: ['Développement', 'Recette'],
      effort: 'Moyen',
      priority: 'Haute'
    },
    {
      id: 'cl_002',
      title: 'Contraste des textes',
      description: 'Le rapport de contraste entre le texte et son arrière-plan doit être suffisant',
      category: 'Accessibilité',
      subcategory: 'Visuel',
      reference: ['WCAG 2.1', 'RGAA 4.0'],
      profil: ['Designer', 'Intégrateur'],
      phase: ['Conception', 'Développement'],
      effort: 'Faible',
      priority: 'Haute'
    },
    {
      id: 'cl_003',
      title: 'Temps de chargement',
      description: 'Les pages doivent se charger en moins de 3 secondes sur une connexion 3G',
      category: 'Performance',
      subcategory: 'Chargement',
      reference: ['Core Web Vitals'],
      profil: ['Développeur'],
      phase: ['Développement', 'Optimisation'],
      effort: 'Élevé',
      priority: 'Moyenne'
    }
  ];
  
  /**
   * Constructeur du service checklist
   */
  constructor() {
    super('ChecklistItem', 'checklistDbId');
  }
  
  /**
   * Filtre les items de checklist selon les critères fournis
   * 
   * @param items Items à filtrer
   * @param filter Critères de filtre
   * @returns Items filtrés
   */
  private filterItems(items: ChecklistItem[], filter?: ChecklistItemFilter): ChecklistItem[] {
    if (!filter) {
      return items;
    }
    
    return items.filter(item => {
      // Filtrer par catégorie
      if (filter.category && item.category !== filter.category) {
        return false;
      }
      
      // Filtrer par sous-catégorie
      if (filter.subcategory && item.subcategory !== filter.subcategory) {
        return false;
      }
      
      // Filtrer par phase
      if (filter.phase && item.phase && !item.phase.includes(filter.phase)) {
        return false;
      }
      
      // Filtrer par profil
      if (filter.profil && item.profil && !item.profil.includes(filter.profil)) {
        return false;
      }
      
      // Filtrer par recherche textuelle
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return (
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }
  
  /**
   * Génère des entités fictives pour le mode mock
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected async getMockEntities(filter?: any): Promise<ChecklistItem[]> {
    const checklistFilter = filter as unknown as ChecklistItemFilter;
    return Promise.resolve(this.filterItems(this.mockItems, checklistFilter));
  }
  
  /**
   * Crée une entité fictive en mode mock
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected async mockCreate(data: CreateChecklistItemData): Promise<ChecklistItem> {
    const newItem: ChecklistItem = {
      id: generateMockId('cl'),
      ...data
    };
    
    this.mockItems.push(newItem);
    return Promise.resolve(newItem);
  }
  
  /**
   * Met à jour une entité fictive en mode mock
   * 
   * @param entity Entité à mettre à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected async mockUpdate(entity: ChecklistItem): Promise<ChecklistItem> {
    const index = this.mockItems.findIndex(item => item.id === entity.id);
    
    if (index === -1) {
      throw new Error(`ChecklistItem #${entity.id} non trouvé`);
    }
    
    this.mockItems[index] = entity;
    return Promise.resolve(entity);
  }
  
  /**
   * Récupère un item de checklist par son identifiant
   * 
   * @param id Identifiant de l'item
   * @returns Promise résolvant vers l'item ou null si non trouvé
   */
  public async getChecklistItemById(id: string): Promise<ChecklistItem | null> {
    const response = await this.getById(id);
    
    if (!response.success || !response.data) {
      return null;
    }
    
    return response.data;
  }
  
  /**
   * Récupère tous les items de checklist
   * 
   * @param filter Filtre optionnel pour les items
   * @returns Promise résolvant vers un tableau d'items
   */
  public async getChecklistItems(filter?: ChecklistItemFilter): Promise<ChecklistItem[]> {
    const response = await this.getAll(filter as any);
    
    if (!response.success || !response.data) {
      return [];
    }
    
    return response.data;
  }
  
  /**
   * Crée un nouvel item de checklist
   * 
   * @param item Données de l'item à créer
   * @returns Promise résolvant vers l'item créé
   */
  public async createChecklistItem(item: CreateChecklistItemData): Promise<ChecklistItem> {
    const response = await this.create(item);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création de l\'item de checklist');
    }
    
    return response.data;
  }
  
  /**
   * Met à jour un item de checklist existant
   * 
   * @param item Item de checklist à mettre à jour
   * @returns Promise résolvant vers l'item mis à jour
   */
  public async updateChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
    const { id, ...data } = item;
    const response = await this.update(id, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || `Erreur lors de la mise à jour de l'item de checklist #${id}`);
    }
    
    return response.data;
  }
  
  /**
   * Supprime un item de checklist
   * 
   * @param id Identifiant de l'item à supprimer
   * @returns Promise résolvant vers true si la suppression a réussi
   */
  public async deleteChecklistItem(id: string): Promise<boolean> {
    const response = await this.delete(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || `Erreur lors de la suppression de l'item de checklist #${id}`);
    }
    
    return true;
  }
}

/**
 * Instance partagée du service checklist
 */
export const checklistService = new ChecklistService();

/**
 * API publique pour les items de checklist
 */
export const checklistsApi = {
  getChecklistItems: checklistService.getChecklistItems.bind(checklistService),
  getChecklistItemById: checklistService.getChecklistItemById.bind(checklistService),
  createChecklistItem: checklistService.createChecklistItem.bind(checklistService),
  updateChecklistItem: checklistService.updateChecklistItem.bind(checklistService),
  deleteChecklistItem: checklistService.deleteChecklistItem.bind(checklistService)
};

export default checklistService;
