
import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/services/cache/cacheManager';
import { CacheFetchOptions } from '@/services/cache/types';

/**
 * Hook React pour utiliser le système de cache
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Omit<CacheFetchOptions<T>, 'fetcher'> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  // Fonction pour récupérer les données
  const fetchData = useCallback(async (force: boolean = false) => {
    setError(null);
    
    if (force) {
      setIsLoading(true);
      // Invalider le cache si force=true
      cacheManager.invalidate(key);
    }
    
    try {
      const result = await cacheManager.fetch<T>(key, {
        fetcher,
        ...options,
        onSuccess: (newData, fromCache) => {
          setData(newData);
          setIsStale(fromCache && options.staleWhileRevalidate === true);
          
          // Appeler le callback onSuccess si fourni
          if (options.onSuccess) {
            options.onSuccess(newData, fromCache);
          }
        },
        onError: (fetchError) => {
          setError(fetchError);
          
          // Appeler le callback onError si fourni
          if (options.onError) {
            options.onError(fetchError);
          }
        },
        onLoading: (loading) => {
          setIsLoading(loading);
          
          // Appeler le callback onLoading si fourni
          if (options.onLoading) {
            options.onLoading(loading);
          }
        }
      });
      
      return result;
    } catch (e) {
      // L'erreur est déjà gérée par les callbacks
      return null;
    }
  }, [key, fetcher, options]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true),
    invalidate: () => cacheManager.invalidate(key)
  };
}

/**
 * Version simplifiée du hook useCache pour les cas d'utilisation simples
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useCache<T>(key, fetcher, { ttl });
}

/**
 * Hook pour utiliser le cache avec la stratégie stale-while-revalidate
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useCache<T>(key, fetcher, { 
    staleWhileRevalidate: true,
    ttl
  });
}
