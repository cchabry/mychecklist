
import { CorrectiveAction, ActionPriority, ActionStatus } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des actions correctives
 */
export class ActionsService extends BaseService<CorrectiveAction> {
  constructor() {
    super('actions', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }
  
  /**
   * Récupère une action corrective par son ID
   */
  protected async fetchById(id: string): Promise<CorrectiveAction | null> {
    try {
      return await notionApi.getAction(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'action corrective #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère toutes les actions correctives
   */
  protected async fetchAll(filters?: QueryFilters): Promise<CorrectiveAction[]> {
    try {
      const actions = await notionApi.getActions();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(actions, filters);
      }
      
      return actions;
    } catch (error) {
      console.error('Erreur lors de la récupération des actions correctives:', error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle action corrective
   */
  protected async createItem(data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    if (!data.evaluationId) {
      throw new Error("L'ID de l'évaluation est requis");
    }
    
    return await notionApi.createAction({
      evaluationId: data.evaluationId,
      targetScore: data.targetScore || '',
      priority: data.priority || ActionPriority.MEDIUM,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.TODO,
      progress: data.progress || 0
    });
  }
  
  /**
   * Met à jour une action corrective existante
   */
  protected async updateItem(id: string, data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const existingAction = await this.fetchById(id);
    
    if (!existingAction) {
      throw new Error(`Action corrective #${id} non trouvée`);
    }
    
    return await notionApi.updateAction(id, {
      ...data
    });
  }
  
  /**
   * Supprime une action corrective
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteAction(id);
  }
  
  /**
   * Récupère les actions correctives pour une évaluation spécifique
   */
  async getByEvaluationId(evaluationId: string): Promise<CorrectiveAction[]> {
    // Vérifier d'abord le cache
    const cacheKey = `${this.entityName}:evaluation:${evaluationId}`;
    const cached = await this.entityCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      const actions = await notionApi.getActionsByEvaluationId(evaluationId);
      
      // Mettre en cache pour les requêtes futures
      await this.entityCache.set(cacheKey, actions, this.cacheTTL);
      
      return actions;
    } catch (error) {
      console.error(`Erreur lors de la récupération des actions correctives pour l'évaluation #${evaluationId}:`, error);
      return [];
    }
  }
  
  /**
   * Récupère les actions correctives dont le délai d'échéance approche
   */
  async getUpcomingActions(daysThreshold: number = 7): Promise<CorrectiveAction[]> {
    const allActions = await this.getAll(undefined, { status: ActionStatus.IN_PROGRESS });
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    return allActions.filter(action => {
      if (!action.dueDate) return false;
      
      const dueDate = new Date(action.dueDate);
      return dueDate > today && dueDate <= thresholdDate;
    });
  }
  
  /**
   * Récupère les actions correctives en retard
   */
  async getOverdueActions(): Promise<CorrectiveAction[]> {
    const allActions = await this.getAll(undefined, { status: ActionStatus.IN_PROGRESS });
    const today = new Date();
    
    return allActions.filter(action => {
      if (!action.dueDate) return false;
      
      const dueDate = new Date(action.dueDate);
      return dueDate < today;
    });
  }
  
  /**
   * Met à jour le statut d'une action corrective
   */
  async updateStatus(id: string, status: ActionStatus, progress: number = 0): Promise<CorrectiveAction> {
    return this.update(id, { status, progress });
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux actions correctives
   */
  private applyFilters(actions: CorrectiveAction[], filters: QueryFilters): CorrectiveAction[] {
    return actions.filter(action => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const actionValue = action[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(actionValue);
        }
        
        return actionValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const actionsService = new ActionsService();
