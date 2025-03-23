
import { useState, useEffect, useCallback } from 'react';
import { useCache } from '@/hooks/cache/useCache';

/**
 * Hook pour utiliser un service avec mise en cache
 */
export function useServiceWithCache<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options?: {
    invalidateOn?: string[];
    enabled?: boolean;
    ttl?: number;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { getCache, setCache, invalidateCache } = useCache();
  
  const fetch = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Essayer de récupérer depuis le cache
      if (!forceRefresh) {
        const cached = getCache<T>(cacheKey);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          return cached;
        }
      }
      
      // Récupérer les données
      const result = await fetchFn();
      
      // Mettre en cache
      setCache(cacheKey, result, options?.ttl);
      
      // Mettre à jour l'état
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey, getCache, setCache, options?.ttl]);
  
  const invalidate = useCallback(() => {
    invalidateCache(cacheKey);
  }, [invalidateCache, cacheKey]);
  
  const refresh = useCallback(() => {
    return fetch(true);
  }, [fetch]);
  
  // Charger les données au montage si activé
  useEffect(() => {
    if (options?.enabled !== false) {
      fetch();
    }
  }, [fetch, options?.enabled]);
  
  return {
    data,
    isLoading,
    error,
    fetch,
    refresh,
    invalidate
  };
}
