import { Exigence, ImportanceLevel } from '@/lib/types';
import { BaseService } from './baseService';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';

/**
 * Service pour la gestion des exigences
 */
export class ExigencesService extends BaseService<Exigence> {
  constructor() {
    super('exigences', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }
  
  /**
   * Récupère une exigence par son ID
   */
  protected async fetchById(id: string): Promise<Exigence | null> {
    try {
      return await notionApi.getExigence(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'exigence #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère toutes les exigences
   */
  protected async fetchAll(filters?: QueryFilters): Promise<Exigence[]> {
    try {
      const exigences = await notionApi.getExigences();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(exigences, filters);
      }
      
      return exigences;
    } catch (error) {
      console.error('Erreur lors de la récupération des exigences:', error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle exigence
   */
  protected async createItem(data: Partial<Exigence>): Promise<Exigence> {
    if (!data.projectId) {
      throw new Error('L\'ID du projet est requis');
    }
    
    if (!data.itemId) {
      throw new Error('L\'ID de l\'item de checklist est requis');
    }
    
    return await notionApi.createExigence({
      projectId: data.projectId,
      itemId: data.itemId,
      importance: data.importance || ImportanceLevel.NA,
      comment: data.comment || '',
      ...data
    });
  }
  
  /**
   * Met à jour une exigence existante
   */
  protected async updateItem(id: string, data: Partial<Exigence>): Promise<Exigence> {
    const existingExigence = await this.fetchById(id);
    
    if (!existingExigence) {
      throw new Error(`Exigence #${id} non trouvée`);
    }
    
    return await notionApi.updateExigence(id, {
      ...existingExigence,
      ...data,
      id // S'assurer que l'ID reste inchangé
    });
  }
  
  /**
   * Supprime une exigence
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteExigence(id);
  }
  
  /**
   * Récupère les exigences pour un projet spécifique
   */
  async getByProject(projectId: string): Promise<Exigence[]> {
    return this.getAll(undefined, { projectId });
  }
  
  /**
   * Récupère une exigence spécifique par projet et item
   */
  async getByProjectAndItem(projectId: string, itemId: string): Promise<Exigence | null> {
    const exigences = await this.getByProject(projectId);
    return exigences.find(e => e.itemId === itemId) || null;
  }
  
  /**
   * Met à jour ou crée une exigence pour un projet et un item
   */
  async setExigence(projectId: string, itemId: string, importance: ImportanceLevel, comment: string = ''): Promise<Exigence> {
    const existing = await this.getByProjectAndItem(projectId, itemId);
    
    if (existing) {
      return this.update(existing.id, { importance, comment });
    } else {
      return this.create({
        projectId,
        itemId,
        importance,
        comment
      });
    }
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux exigences
   */
  private applyFilters(exigences: Exigence[], filters: QueryFilters): Exigence[] {
    return exigences.filter(exigence => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const exigenceValue = exigence[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(exigenceValue);
        }
        
        return exigenceValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const exigencesService = new ExigencesService();
