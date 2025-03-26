
import { useState, useEffect } from 'react';
import { useCache } from './cache/useCache';
import { useNotionAPI, NotionAPIOptions } from './notion/useNotionAPI';
import { CacheOptions } from '@/services/cache/types';
import { CacheEntry } from '@/services/cache/types/cacheEntry';

interface NotionCachedAPIOptions<T> extends NotionAPIOptions, Partial<CacheOptions> {
  // Options spécifiques au cache
  ttl?: number;
  staleTime?: number;
  revalidateOnMount?: boolean;
}

/**
 * Hook pour utiliser l'API Notion avec mise en cache des résultats
 */
export function useNotionCachedAPI<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  options: NotionCachedAPIOptions<T> = {}
) {
  const { 
    // Options de cache
    ttl,
    staleTime = 60 * 1000, // 1 minute par défaut
    revalidateOnMount = true,
    
    // Autres options
    ...notionOptions 
  } = options;
  
  const cacheKey = `notion:${method}:${endpoint}:${JSON.stringify(body || {})}`;
  const cache = useCache();
  const { execute, isLoading: isNotionLoading } = useNotionAPI();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // Fonction pour charger les données depuis l'API
  const fetchFromAPI = async (): Promise<T> => {
    try {
      setIsLoading(true);
      const result = await execute<T>(endpoint, method, body, undefined, notionOptions);
      
      // Sauvegarder dans le cache
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      }, ttl);
      
      setData(result);
      setTimestamp(Date.now());
      setIsStale(false);
      setError(null);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    // Vérifier le cache
    const cachedData = cache.get<{ data: T, timestamp: number }>(cacheKey);
    
    if (cachedData && 'data' in cachedData) {
      // Déterminer si les données sont périmées
      const isDataStale = staleTime && Date.now() - cachedData.timestamp > staleTime;
      
      // Utiliser les données du cache
      setData(cachedData.data);
      setTimestamp(cachedData.timestamp);
      setIsStale(isDataStale);
      setIsLoading(false);
      
      // Recharger en arrière-plan si les données sont périmées et revalidateOnMount est activé
      if (isDataStale && revalidateOnMount) {
        fetchFromAPI().catch(console.error);
      }
    } else if (revalidateOnMount) {
      // Rien en cache ou revalidation forcée
      fetchFromAPI().catch(console.error);
    } else {
      // Rien en cache, pas de revalidation automatique
      setIsLoading(false);
    }
  }, [cacheKey]);

  return {
    data,
    isLoading,
    isStale,
    error,
    timestamp,
    refetch: fetchFromAPI
  };
}
