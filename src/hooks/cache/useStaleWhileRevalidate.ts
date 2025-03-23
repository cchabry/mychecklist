
import { useState, useEffect, useCallback } from 'react';
import { useCache } from './useCache';

/**
 * Hook pour implémenter la stratégie "stale-while-revalidate"
 * Retourne les données du cache même si périmées, et recharge en arrière-plan
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleTime?: number;
    enabled?: boolean;
  } = {}
) {
  const { ttl, staleTime = 60 * 1000, enabled = true } = options;
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger les données
  const fetchData = useCallback(async (background = false) => {
    if (!background) {
      setIsLoading(true);
    }
    
    try {
      const result = await fetcher();
      
      // Sauvegarder dans le cache avec timestamp
      cache.set(key, { 
        data: result,
        timestamp: Date.now()
      }, ttl);
      
      setData(result);
      setIsStale(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [key, fetcher, ttl, cache]);

  // Effet pour charger les données initialement
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    const loadInitialData = async () => {
      // Vérifier le cache
      const cachedEntry = cache.get<{ data: T, timestamp: number }>(key);
      
      if (cachedEntry && 'data' in cachedEntry && 'timestamp' in cachedEntry) {
        // Vérifier si les données sont périmées
        const isDataStale = Date.now() - cachedEntry.timestamp > staleTime;
        
        // Utiliser les données du cache, même si périmées
        setData(cachedEntry.data);
        setIsStale(isDataStale);
        setIsLoading(false);
        
        // Si les données sont périmées, recharger en arrière-plan
        if (isDataStale) {
          fetchData(true).catch(err => {
            console.error(`Erreur lors du rechargement en arrière-plan pour ${key}:`, err);
          });
        }
      } else {
        // Rien en cache, charger les données
        try {
          await fetchData();
        } catch (err) {
          console.error(`Erreur lors du chargement initial pour ${key}:`, err);
        }
      }
    };

    loadInitialData();
  }, [key, enabled, staleTime, cache, fetchData]);

  return {
    data,
    isLoading,
    isStale,
    error,
    refetch: () => fetchData(false)
  };
}
