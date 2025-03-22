
import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/services/cache/managers/defaultManager';
import { CacheFetchOptions } from '@/services/cache/types';

/**
 * Hook React principal pour utiliser le système de cache
 * @param key - Clé d'identification dans le cache
 * @param fetcher - Fonction pour récupérer les données si absentes ou expirées
 * @param ttl - Durée de vie en ms ou options avancées
 * @returns Objet avec données, état, et fonctions de contrôle
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number | Omit<CacheFetchOptions<T>, 'fetcher'>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  // Préparer les options basées sur les paramètres
  const options: Omit<CacheFetchOptions<T>, 'fetcher'> = typeof ttl === 'number' 
    ? { ttl } 
    : ttl || {};
  
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
      const fetchError = e instanceof Error ? e : new Error(String(e));
      setError(fetchError);
      return null;
    }
  }, [key, fetcher, options]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    
    load();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted = false;
    };
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true),
    invalidate: () => cacheManager.invalidate(key),
    // Fonctions supplémentaires
    setData: (newData: T) => {
      setData(newData);
      cacheManager.set(key, newData, options.ttl);
    },
    reset: () => {
      setData(null);
      setError(null);
      setIsLoading(false);
    }
  };
}
