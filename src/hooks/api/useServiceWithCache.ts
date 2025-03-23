
import { useState, useCallback, useEffect, useRef } from 'react';
import { QueryOptions } from './types';

export interface ServiceWithCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  fetchData: () => Promise<T>;
  reload: () => void;
  invalidateCache: () => void;
}

/**
 * Hook pour utiliser un service avec mise en cache
 * @param serviceFunction La fonction du service à appeler
 * @param dependencies Les dépendances pour recalculer les données
 * @param options Options de configuration
 */
export function useServiceWithCache<T>(
  serviceFunction: () => Promise<T>,
  dependencies: any = [],
  options: QueryOptions = {}
): ServiceWithCacheResult<T> {
  const { immediate = true, cacheKey, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  
  // Convert dependencies to array if it's not already
  const deps = Array.isArray(dependencies) ? dependencies : [dependencies];

  const fetchData = useCallback(async (): Promise<T> => {
    if (!enabled) {
      return data as T;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await serviceFunction();
      
      if (isMounted.current) {
        setData(result);
        setIsLoading(false);
      }
      
      return result;
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
      }
      throw err;
    }
  }, [serviceFunction, enabled, data]);

  const reload = useCallback(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      // Si on implémente un système de cache, on pourrait l'invalider ici
      console.log(`Cache invalidated for key: ${cacheKey}`);
    }
    reload();
  }, [cacheKey, reload]);

  useEffect(() => {
    isMounted.current = true;
    
    if (immediate && enabled) {
      fetchData().catch(console.error);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, immediate, enabled, ...deps]);

  return {
    data,
    isLoading,
    error,
    fetchData,
    reload,
    invalidateCache
  };
}
