
/**
 * Utilitaires pour la gestion du cache par entité
 */

import { cacheManager } from '../managers/defaultManager';

/**
 * Classe d'abstraction pour gérer le cache d'un type d'entité spécifique
 */
export class EntityCache<T> {
  private cachePrefix: string;
  private defaultTTL: number;
  
  constructor(entityName: string, defaultTTL?: number) {
    this.cachePrefix = `entity:${entityName}:`;
    this.defaultTTL = defaultTTL || 5 * 60 * 1000; // 5 minutes par défaut
  }
  
  /**
   * Récupère une entité par son ID
   */
  getById(id: string): T | null {
    return cacheManager.get<T>(`${this.cachePrefix}${id}`);
  }
  
  /**
   * Récupère une liste d'entités
   */
  getList(listKey: string = 'all'): T[] {
    return cacheManager.get<T[]>(`${this.cachePrefix}list:${listKey}`) || [];
  }
  
  /**
   * Stocke une entité avec son ID
   */
  setById(id: string, entity: T, ttl?: number): void {
    cacheManager.set(`${this.cachePrefix}${id}`, entity, ttl || this.defaultTTL);
  }
  
  /**
   * Stocke une liste d'entités
   */
  setList(entities: T[], listKey: string = 'all', ttl?: number): void {
    cacheManager.set(`${this.cachePrefix}list:${listKey}`, entities, ttl || this.defaultTTL);
  }
  
  /**
   * Supprime une entité par ID
   */
  removeById(id: string): void {
    cacheManager.invalidate(`${this.cachePrefix}${id}`);
  }
  
  /**
   * Supprime une liste d'entités
   */
  removeList(listKey: string = 'all'): void {
    cacheManager.invalidate(`${this.cachePrefix}list:${listKey}`);
  }
  
  /**
   * Invalide tout le cache pour ce type d'entité
   */
  invalidateAll(): number {
    return cacheManager.invalidateByPrefix(this.cachePrefix);
  }
  
  /**
   * Récupère une entité par ID, ou la charge si absente du cache
   */
  async fetchById(id: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cacheKey = `${this.cachePrefix}${id}`;
    return cacheManager.fetch<T>(cacheKey, {
      fetcher,
      ttl: ttl || this.defaultTTL
    });
  }
  
  /**
   * Récupère une liste d'entités, ou la charge si absente du cache
   */
  async fetchList(fetcher: () => Promise<T[]>, listKey: string = 'all', ttl?: number): Promise<T[]> {
    const cacheKey = `${this.cachePrefix}list:${listKey}`;
    return cacheManager.fetch<T[]>(cacheKey, {
      fetcher,
      ttl: ttl || this.defaultTTL
    });
  }
}

// Instancier les caches pour les différentes entités du système

// Cache pour les projets (TTL 30 minutes)
export const projectsCache = new EntityCache<any>('projects', 30 * 60 * 1000);

// Cache pour les audits (TTL 10 minutes)
export const auditsCache = new EntityCache<any>('audits', 10 * 60 * 1000);

// Cache pour les pages d'échantillon (TTL 15 minutes)
export const pagesCache = new EntityCache<any>('pages', 15 * 60 * 1000);

// Cache pour la checklist (TTL 60 minutes)
export const checklistsCache = new EntityCache<any>('checklists', 60 * 60 * 1000);

// Cache pour les exigences (TTL 15 minutes)
export const exigencesCache = new EntityCache<any>('exigences', 15 * 60 * 1000);

// Cache pour les évaluations (TTL 2 minutes - données fréquemment modifiées)
export const evaluationsCache = new EntityCache<any>('evaluations', 2 * 60 * 1000);

// Cache pour les actions correctives (TTL 2 minutes - données fréquemment modifiées)
export const actionsCache = new EntityCache<any>('actions', 2 * 60 * 1000);
