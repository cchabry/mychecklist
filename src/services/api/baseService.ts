
import { cacheManager } from '../cache/cacheManager';
import { createEntityCache } from '../cache/utils';
import { ApiResponse, ApiServiceOptions, BaseApiService, QueryFilters } from './types';
import { CacheFetchOptions } from '../cache/types';
import { toast } from 'sonner';

/**
 * Service de base pour les appels API avec cache
 */
export abstract class BaseService<T extends { id: string }> implements BaseApiService<T> {
  protected entityName: string;
  protected cachePrefix: string;
  protected cacheTTL: number;
  protected entityCache: ReturnType<typeof createEntityCache<T>>;
  protected useMock: boolean;
  
  constructor(entityName: string, options: ApiServiceOptions = {}) {
    this.entityName = entityName;
    this.cachePrefix = options.cachePrefix || `entity:${entityName}`;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes par défaut
    this.useMock = options.useMock || localStorage.getItem('notion_mock_mode') === 'true';
    
    // Initialiser le cache spécifique à cette entité
    this.entityCache = createEntityCache<T>(entityName);
  }
  
  /**
   * Méthode abstraite à implémenter pour récupérer une entité par ID
   */
  protected abstract fetchById(id: string): Promise<T | null>;
  
  /**
   * Méthode abstraite à implémenter pour récupérer toutes les entités
   */
  protected abstract fetchAll(filters?: QueryFilters): Promise<T[]>;
  
  /**
   * Méthode abstraite à implémenter pour créer une entité
   */
  protected abstract createItem(data: Partial<T>): Promise<T>;
  
  /**
   * Méthode abstraite à implémenter pour mettre à jour une entité
   */
  protected abstract updateItem(id: string, data: Partial<T>): Promise<T>;
  
  /**
   * Méthode abstraite à implémenter pour supprimer une entité
   */
  protected abstract deleteItem(id: string): Promise<boolean>;
  
  /**
   * Récupère une entité par ID avec gestion du cache
   */
  async getById(id: string, options?: Omit<CacheFetchOptions<T>, 'fetcher'>): Promise<T | null> {
    const cacheKey = `${this.entityName}:${id}`;
    
    try {
      const result = await cacheManager.fetch<T>(cacheKey, {
        fetcher: () => this.fetchById(id),
        ttl: this.cacheTTL,
        ...options
      });
      
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${this.entityName} #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère toutes les entités avec gestion du cache
   */
  async getAll(options?: Omit<CacheFetchOptions<T[]>, 'fetcher'>, filters?: QueryFilters): Promise<T[]> {
    const cacheKey = this.getCacheKeyWithFilters(`${this.entityName}:list`, filters);
    
    try {
      const result = await cacheManager.fetch<T[]>(cacheKey, {
        fetcher: () => this.fetchAll(filters),
        ttl: this.cacheTTL,
        ...options
      });
      
      return result || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération de la liste de ${this.entityName}:`, error);
      return [];
    }
  }
  
  /**
   * Crée une nouvelle entité et invalide le cache
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const result = await this.createItem(data);
      
      // Invalider le cache des listes car une nouvelle entité a été ajoutée
      this.invalidateList();
      
      toast.success(`${this.entityName} créé avec succès`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la création de ${this.entityName}:`, error);
      toast.error(`Erreur lors de la création`, { 
        description: `Le ${this.entityName} n'a pas pu être créé`
      });
      throw error;
    }
  }
  
  /**
   * Met à jour une entité et invalide le cache
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const result = await this.updateItem(id, data);
      
      // Invalider le cache de l'entité mise à jour et des listes
      this.invalidateItem(id);
      this.invalidateList();
      
      toast.success(`${this.entityName} mis à jour avec succès`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${this.entityName} #${id}:`, error);
      toast.error(`Erreur lors de la mise à jour`, { 
        description: `Le ${this.entityName} n'a pas pu être mis à jour`
      });
      throw error;
    }
  }
  
  /**
   * Supprime une entité et invalide le cache
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.deleteItem(id);
      
      // Invalider le cache de l'entité supprimée et des listes
      this.invalidateItem(id);
      this.invalidateList();
      
      if (result) {
        toast.success(`${this.entityName} supprimé avec succès`);
      }
      
      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${this.entityName} #${id}:`, error);
      toast.error(`Erreur lors de la suppression`, { 
        description: `Le ${this.entityName} n'a pas pu être supprimé`
      });
      return false;
    }
  }
  
  /**
   * Invalide le cache d'une entité spécifique
   */
  invalidateItem(id: string): void {
    cacheManager.invalidate(`${this.entityName}:${id}`);
  }
  
  /**
   * Invalide le cache de toutes les listes d'entités
   */
  invalidateList(): void {
    cacheManager.invalidateByPrefix(`${this.entityName}:list`);
  }
  
  /**
   * Invalide tout le cache lié à cette entité
   */
  invalidateAll(): void {
    cacheManager.invalidateByPrefix(`${this.entityName}`);
  }
  
  /**
   * Génère une clé de cache qui inclut les filtres de recherche
   */
  protected getCacheKeyWithFilters(baseKey: string, filters?: QueryFilters): string {
    if (!filters || Object.keys(filters).length === 0) {
      return baseKey;
    }
    
    // Trier les clés pour garantir la cohérence des clés de cache
    const sortedFilters = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as QueryFilters);
    
    return `${baseKey}:${JSON.stringify(sortedFilters)}`;
  }
}
