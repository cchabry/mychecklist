
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';
import { QueryFilters } from './types';

/**
 * Options pour les services d'API
 */
export interface ServiceOptions {
  cacheTTL?: number;
  allowCaching?: boolean;
}

/**
 * Service de base abstrait pour les opérations CRUD
 */
export abstract class BaseServiceAbstract<T> {
  protected entityType: string;
  protected options: ServiceOptions;
  private cachePrefix: string;
  
  constructor(entityType: string, options: ServiceOptions = {}) {
    this.entityType = entityType;
    this.options = {
      cacheTTL: 5 * 60 * 1000, // 5 minutes par défaut
      allowCaching: true,
      ...options
    };
    this.cachePrefix = `cache_${entityType}_`;
  }
  
  /**
   * Récupère toutes les entités avec filtrage optionnel
   */
  async getAll(cursor?: string, filters?: QueryFilters): Promise<T[]> {
    try {
      return this.fetchAll(filters);
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${this.entityType}:`, error);
      return [];
    }
  }
  
  /**
   * Récupère une entité par son ID
   */
  async getById(id: string): Promise<T | null> {
    if (!id) {
      return null;
    }
    
    try {
      return this.fetchById(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${this.entityType} #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Crée une nouvelle entité
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      return this.createItem(data);
    } catch (error) {
      console.error(`Erreur lors de la création de ${this.entityType}:`, error);
      throw error;
    }
  }
  
  /**
   * Met à jour une entité existante
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      return this.updateItem(id, data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${this.entityType} #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime une entité
   */
  async delete(id: string): Promise<boolean> {
    try {
      return this.deleteItem(id);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${this.entityType} #${id}:`, error);
      return false;
    }
  }
  
  /**
   * Invalide le cache pour toutes les entités
   */
  invalidateList(): void {
    // Méthode vide par défaut, à surcharger si besoin
    console.log(`Cache invalidé pour ${this.entityType}`);
  }
  
  /**
   * Vide complètement le cache de ce service
   */
  clearCache(): void {
    try {
      // Supprimer toutes les entrées de cache qui commencent par le préfixe
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Supprimer les clés
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cache vidé pour ${this.entityType} (${keysToRemove.length} entrées)`);
    } catch (error) {
      console.error(`Erreur lors du vidage du cache pour ${this.entityType}:`, error);
    }
  }
  
  /**
   * Méthodes abstraites à implémenter dans les classes dérivées
   */
  protected abstract fetchById(id: string): Promise<T | null>;
  protected abstract fetchAll(filters?: QueryFilters): Promise<T[]>;
  protected abstract createItem(data: Partial<T>): Promise<T>;
  protected abstract updateItem(id: string, data: Partial<T>): Promise<T>;
  protected abstract deleteItem(id: string): Promise<boolean>;
}
