
import { useState, useCallback, useEffect } from 'react';
import { QueryFilters, QueryOptions } from './types';
import { cacheService } from '@/services/cache';

type Cache<T> = {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
};

/**
 * Hook pour utiliser un service avec gestion de cache
 */
export function useServiceWithCache<T, P = void>(
  serviceFn: (params?: P, filters?: QueryFilters) => Promise<T>,
  options: QueryOptions = {}
) {
  const {
    cacheKey,
    cacheTTL,
    immediate = true,
    params,
    filters,
    onSuccess,
    onError
  } = options;

  const cache = cacheService as Cache<T>;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCacheKey = useCallback(() => {
    if (typeof cacheKey === 'function') {
      return cacheKey(params as P, filters);
    }
    return cacheKey || 'default-cache-key';
  }, [cacheKey, params, filters]);

  const fetchData = useCallback(async () => {
    const actualCacheKey = getCacheKey();
    
    // Vérifier si les données sont en cache
    if (actualCacheKey) {
      const cachedData = cache.get(actualCacheKey);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceFn(params as P, filters);
      
      // Mettre en cache si un cacheKey est fourni
      if (actualCacheKey) {
        cache.set(actualCacheKey, result, cacheTTL);
      }
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [serviceFn, params, filters, getCacheKey, cache, cacheTTL, onSuccess, onError]);

  const invalidateCache = useCallback(() => {
    const actualCacheKey = getCacheKey();
    if (actualCacheKey) {
      cache.remove(actualCacheKey);
    }
  }, [cache, getCacheKey]);

  const reload = useCallback(() => {
    invalidateCache();
    return fetchData();
  }, [fetchData, invalidateCache]);

  // Chargement initial si immédiate est true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    isLoading,
    error,
    fetchData,
    invalidateCache,
    reload,
    setData
  };
}
