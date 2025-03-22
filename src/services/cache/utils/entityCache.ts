
/**
 * Utilitaires pour la gestion du cache par entité
 */

import { cacheManager } from '../managers/defaultManager';

/**
 * Classe d'abstraction pour gérer le cache d'un type d'entité spécifique
 */
export class EntityCache<T> {
  private cachePrefix: string;
  
  constructor(entityName: string) {
    this.cachePrefix = `entity:${entityName}:`;
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
    cacheManager.set(`${this.cachePrefix}${id}`, entity, ttl);
  }
  
  /**
   * Stocke une liste d'entités
   */
  setList(entities: T[], listKey: string = 'all', ttl?: number): void {
    cacheManager.set(`${this.cachePrefix}list:${listKey}`, entities, ttl);
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
}

// Instancier les caches pour les différentes entités
export const projectsCache = new EntityCache('projects');
export const auditsCache = new EntityCache('audits');
export const pagesCache = new EntityCache('pages');
export const checklistsCache = new EntityCache('checklists');
export const exigencesCache = new EntityCache('exigences');
export const evaluationsCache = new EntityCache('evaluations');
export const actionsCache = new EntityCache('actions');
