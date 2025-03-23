
import { ApiServiceOptions, QueryFilters } from './types';
import { CacheFetchOptions } from '../cache/types';
import { EntityCache } from '../cache/utils/entityCache';

/**
 * Classe de service de base fournissant des fonctionnalités CRUD standard pour une entité donnée
 * Cette classe sera étendue par les services spécifiques pour chaque entité
 */
export abstract class BaseService<T> {
  protected entityName: string;
  protected cacheTTL: number;
  protected entityCache: EntityCache<T>;

  constructor(entityName: string, options: ApiServiceOptions = {}) {
    this.entityName = entityName;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes par défaut
    
    // Initialisation du cache pour cette entité
    this.entityCache = new EntityCache<T>(entityName, this.cacheTTL);
  }
  
  /**
   * Récupère une entité par son ID
   * @param id Identifiant de l'entité
   * @param options Options de récupération (cache, etc.)
   */
  async getById(id: string, options?: Omit<CacheFetchOptions<T>, 'fetcher'>): Promise<T | null> {
    // Vérifier d'abord le cache, sauf si l'option skipCache est définie
    if (!options?.skipCache) {
      const cached = this.entityCache.getById(id);
      if (cached) return cached;
    }
    
    // Récupérer depuis la source
    const entity = await this.fetchById(id);
    
    // Mettre en cache si trouvé et si l'option skipCache n'est pas définie
    if (entity && !options?.skipCache) {
      this.entityCache.setById(id, entity, options?.ttl || this.cacheTTL);
    }
    
    return entity;
  }
  
  /**
   * Récupère toutes les entités (avec filtrage optionnel)
   * @param options Options de récupération (cache, etc.)
   * @param filters Filtres à appliquer aux résultats
   */
  async getAll(options?: Omit<CacheFetchOptions<T[]>, 'fetcher'>, filters?: QueryFilters): Promise<T[]> {
    // Déterminer la clé de cache en fonction des filtres
    const cacheKey = filters ? `filters:${JSON.stringify(filters)}` : undefined;
    
    // Vérifier d'abord le cache, sauf si l'option skipCache est définie
    if (!options?.skipCache && cacheKey) {
      const cached = this.entityCache.getList(cacheKey);
      if (cached && cached.length > 0) return cached;
    }
    
    // Récupérer depuis la source
    const entities = await this.fetchAll(filters);
    
    // Mettre en cache si trouvé et si l'option skipCache n'est pas définie
    if (entities.length > 0 && !options?.skipCache) {
      this.entityCache.setList(entities, cacheKey, options?.ttl || this.cacheTTL);
    }
    
    return entities;
  }
  
  /**
   * Crée une nouvelle entité
   * @param data Données de l'entité à créer
   */
  async create(data: Partial<T>): Promise<T> {
    const entity = await this.createItem(data);
    
    // Invalider potentiellement la liste pour forcer un rechargement lors du prochain getAll
    this.invalidateList();
    
    return entity;
  }
  
  /**
   * Met à jour une entité existante
   * @param id Identifiant de l'entité
   * @param data Données à mettre à jour
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.updateItem(id, data);
    
    // Mettre à jour le cache et invalider la liste
    this.entityCache.setById(id, entity, this.cacheTTL);
    this.invalidateList();
    
    return entity;
  }
  
  /**
   * Supprime une entité
   * @param id Identifiant de l'entité à supprimer
   */
  async delete(id: string): Promise<boolean> {
    const success = await this.deleteItem(id);
    
    if (success) {
      // Supprimer du cache et invalider la liste
      this.invalidateItem(id);
      this.invalidateList();
    }
    
    return success;
  }
  
  /**
   * Invalide une entrée spécifique du cache
   * @param id Identifiant de l'entité à invalider
   */
  invalidateItem(id: string): void {
    this.entityCache.removeById(id);
  }
  
  /**
   * Invalide la liste d'entités en cache
   */
  invalidateList(): void {
    this.entityCache.removeList();
  }
  
  /**
   * Invalide toutes les entrées de cache pour cette entité
   */
  invalidateAll(): void {
    this.entityCache.invalidateAll();
  }
  
  // Méthodes abstraites à implémenter par les sous-classes
  
  /**
   * Récupère une entité par son ID depuis la source de données
   */
  protected abstract fetchById(id: string): Promise<T | null>;
  
  /**
   * Récupère toutes les entités depuis la source de données
   */
  protected abstract fetchAll(filters?: QueryFilters): Promise<T[]>;
  
  /**
   * Crée une nouvelle entité dans la source de données
   */
  protected abstract createItem(data: Partial<T>): Promise<T>;
  
  /**
   * Met à jour une entité existante dans la source de données
   */
  protected abstract updateItem(id: string, data: Partial<T>): Promise<T>;
  
  /**
   * Supprime une entité de la source de données
   */
  protected abstract deleteItem(id: string): Promise<boolean>;
}
