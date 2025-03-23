
import { useState, useEffect, useCallback } from 'react';
import { useNotionAPI, NotionAPIOptions } from './useNotionAPI';
import { useCache } from './useCache';

interface CacheOptions {
  // Durée de validité du cache en millisecondes
  ttl?: number;
  
  // Durée pendant laquelle les données du cache sont considérées fraîches
  staleTime?: number;
  
  // Revalider automatiquement en arrière-plan
  revalidateOnMount?: boolean;
  
  // Préfixe pour la clé de cache
  keyPrefix?: string;
}

/**
 * Hook combinant le système de cache et le nouveau système operationMode
 * pour les requêtes API Notion avec mise en cache
 */
export function useNotionCachedAPI<T>(
  cacheKey: string,
  apiFn: () => Promise<T>,
  options: NotionAPIOptions<T> & CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    staleTime = 60 * 1000, // 1 minute par défaut
    revalidateOnMount = true,
    keyPrefix = 'notion:',
    ...apiOptions
  } = options;
  
  const { executeOperation, isLoading: isOperationLoading, error: operationError } = useNotionAPI();
  const cache = useCache();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  // Générer la clé complète
  const fullCacheKey = `${keyPrefix}${cacheKey}`;
  
  // Fonction pour charger les données de l'API
  const fetchData = useCallback(async (options: { loadSilently?: boolean } = {}) => {
    try {
      if (!options.loadSilently) {
        setIsLoading(true);
      }
      
      const result = await executeOperation<T>(
        () => apiFn(),
        apiOptions
      );
      
      // Stocker dans le cache
      cache.set(fullCacheKey, {
        data: result,
        timestamp: Date.now()
      }, ttl);
      
      setData(result);
      setIsStale(false);
      setError(null);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      if (!options.loadSilently) {
        setIsLoading(false);
      }
    }
  }, [apiFn, fullCacheKey, ttl, cache, executeOperation, apiOptions]);
  
  // Fonction pour recharger les données
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Fonction pour recharger en arrière-plan
  const silentRefresh = useCallback(() => {
    return fetchData({ loadSilently: true });
  }, [fetchData]);
  
  // Effet initial pour charger les données
  useEffect(() => {
    // Vérifier si nous avons des données en cache
    const cachedEntry = cache.get<{ data: T, timestamp: number }>(fullCacheKey);
    
    if (cachedEntry) {
      // Vérifier si les données sont périmées
      const isDataStale = Date.now() - cachedEntry.timestamp > staleTime;
      
      // Définir les données du cache
      setData(cachedEntry.data);
      setIsStale(isDataStale);
      setIsLoading(false);
      
      // Recharger en arrière-plan si nécessaire
      if (isDataStale && revalidateOnMount) {
        silentRefresh();
      }
    } else {
      // Pas de cache, charger les données
      fetchData();
    }
  }, [fullCacheKey, staleTime, revalidateOnMount, cache, fetchData, silentRefresh]);
  
  return {
    data,
    isLoading,
    error: error || operationError,
    isStale,
    refresh,
    silentRefresh
  };
}
