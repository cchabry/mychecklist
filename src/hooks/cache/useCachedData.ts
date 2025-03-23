
import { useState, useEffect } from 'react';
import { useCache } from './useCache';

/**
 * Hook pour récupérer des données en cache avec chargement automatique
 * @param key Clé du cache
 * @param fetcher Fonction pour récupérer les données si absentes du cache
 * @param options Options de configuration
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
  } = {}
) {
  const { ttl, enabled = true } = options;
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Vérifier le cache d'abord
        const cachedData = cache.get<{ data: T }>(key);
        
        if (cachedData && 'data' in cachedData) {
          setData(cachedData.data);
          setIsLoading(false);
          return;
        }
        
        // Rien en cache, charger les données
        const result = await fetcher();
        
        // Sauvegarder dans le cache
        cache.set(key, { data: result }, ttl);
        
        setData(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Erreur lors du chargement des données pour la clé ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, enabled, cache, fetcher, ttl]);

  const refetch = async () => {
    setIsLoading(true);
    
    try {
      const result = await fetcher();
      cache.set(key, { data: result }, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}
