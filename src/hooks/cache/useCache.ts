
/**
 * Hook pour utiliser le service de cache
 */

import { useCallback } from 'react';
import { cacheService, CacheOptions } from '@/services/cache/cacheService';

/**
 * Hook pour utiliser le service de cache
 */
export function useCache() {
  /**
   * Stocke une valeur dans le cache
   */
  const set = useCallback(<T>(key: string, value: T, options?: CacheOptions | number): void => {
    cacheService.set(key, value, options);
  }, []);
  
  /**
   * Récupère une valeur du cache
   */
  const get = useCallback(<T>(key: string): T | undefined => {
    return cacheService.get<T>(key);
  }, []);
  
  /**
   * Supprime une entrée du cache
   */
  const remove = useCallback((key: string): boolean => {
    return cacheService.delete(key);
  }, []);
  
  /**
   * Vérifie si une clé existe dans le cache
   */
  const has = useCallback((key: string): boolean => {
    return cacheService.has(key);
  }, []);
  
  /**
   * Vide tout le cache
   */
  const clear = useCallback((): void => {
    cacheService.clear();
  }, []);
  
  /**
   * Récupère ou définit une valeur dans le cache
   */
  const getOrSet = useCallback(
    async <T>(key: string, callback: () => Promise<T>, options?: CacheOptions): Promise<T> => {
      return cacheService.getOrSet(key, callback, options);
    },
    []
  );
  
  return { set, get, remove, has, clear, getOrSet };
}
