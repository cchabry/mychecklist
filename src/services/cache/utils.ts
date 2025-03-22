
import { cacheService } from './cache';

/**
 * Utilitaires pour le système de cache
 */
export const cacheUtils = {
  /**
   * Génère une clé de cache unique basée sur un préfixe et des paramètres
   * @param prefix Préfixe de la clé
   * @param params Paramètres à inclure dans la clé
   * @returns Clé de cache unique
   */
  generateKey(prefix: string, params: Record<string, any> = {}): string {
    const paramString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const valueStr = typeof value === 'object' 
          ? JSON.stringify(value)
          : String(value);
        return `${key}:${valueStr}`;
      })
      .join('_');
    
    return paramString ? `${prefix}_${paramString}` : prefix;
  },
  
  /**
   * Crée un cache namespaced
   * @param namespace Espace de noms pour les clés de cache
   * @returns Objet avec des méthodes pour manipuler le cache namespaced
   */
  createNamespace(namespace: string) {
    const prefix = `${namespace}:`;
    
    return {
      /**
       * Récupère une valeur du cache namespaced
       */
      get<T>(key: string): T | null {
        return cacheService.get<T>(`${prefix}${key}`);
      },
      
      /**
       * Enregistre une valeur dans le cache namespaced
       */
      set<T>(key: string, data: T, ttl: number = 0): void {
        cacheService.set(`${prefix}${key}`, data, ttl);
      },
      
      /**
       * Supprime une entrée du cache namespaced
       */
      remove(key: string): void {
        cacheService.remove(`${prefix}${key}`);
      },
      
      /**
       * Supprime toutes les entrées du cache namespaced
       */
      clear(): number {
        return cacheService.removeByPrefix(prefix);
      },
      
      /**
       * Vérifie si une clé existe dans le cache namespaced
       */
      has(key: string): boolean {
        return cacheService.has(`${prefix}${key}`);
      }
    };
  }
};

/**
 * Crée un cache dédié à une entité spécifique
 */
export function createEntityCache<T>(entityName: string) {
  const namespace = `entity:${entityName}`;
  const cache = cacheUtils.createNamespace(namespace);
  
  return {
    /**
     * Récupère une entité par ID
     */
    getById(id: string): T | null {
      return cache.get<T>(id);
    },
    
    /**
     * Récupère une liste d'entités
     */
    getList(listKey: string = 'list'): T[] | null {
      return cache.get<T[]>(listKey);
    },
    
    /**
     * Enregistre une entité
     */
    setById(id: string, entity: T, ttl: number = 0): void {
      cache.set(id, entity, ttl);
    },
    
    /**
     * Enregistre une liste d'entités
     */
    setList(entities: T[], listKey: string = 'list', ttl: number = 0): void {
      cache.set(listKey, entities, ttl);
    },
    
    /**
     * Supprime une entité
     */
    removeById(id: string): void {
      cache.remove(id);
    },
    
    /**
     * Supprime la liste d'entités
     */
    removeList(listKey: string = 'list'): void {
      cache.remove(listKey);
    },
    
    /**
     * Invalide tout le cache de cette entité
     */
    invalidateAll(): number {
      return cache.clear();
    }
  };
}

// Créer des caches spécifiques pour les entités principales
export const projectsCache = createEntityCache<any>('projects');
export const auditsCache = createEntityCache<any>('audits');
export const pagesCache = createEntityCache<any>('pages');
export const checklistsCache = createEntityCache<any>('checklists');
