
import { useState, useEffect, useCallback } from 'react';
import { useNotionApi } from './useNotionApi';
import { useCache } from './useCache';
import { CacheOptions } from '@/services/cache/types';

interface NotionAPIOptions<T> {
  // Données à utiliser en mode démonstration
  demoData?: T;
  
  // Simuler un délai en mode démonstration (ms)
  simulatedDelay?: number;
  
  // Messages personnalisés
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  
  // Contexte pour les rapports d'erreur
  errorContext?: string;
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
  
  const { executeOperation, isLoading: isOperationLoading, error: operationError } = useNotionApi();
  const cacheManager = useCache();
  
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
        {
          ...apiOptions,
          demoData: apiOptions.demoData
        }
      );
      
      // Stocker dans le cache
      const cacheData = {
        data: result,
        timestamp: Date.now()
      };
      
      cacheManager.set(fullCacheKey, cacheData, ttl);
      
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
  }, [apiFn, fullCacheKey, ttl, cacheManager, executeOperation, apiOptions]);
  
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
    const cachedEntry = cacheManager.get(fullCacheKey);
    
    if (cachedEntry && typeof cachedEntry === 'object' && cachedEntry !== null && 'data' in cachedEntry && 'timestamp' in cachedEntry) {
      // Vérifier si les données sont périmées
      const entry = cachedEntry as { data: T, timestamp: number };
      const isDataStale = Date.now() - entry.timestamp > staleTime;
      
      // Définir les données du cache
      setData(entry.data);
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
  }, [fullCacheKey, staleTime, revalidateOnMount, cacheManager, fetchData, silentRefresh]);
  
  return {
    data,
    isLoading,
    error: error || operationError,
    isStale,
    refresh,
    silentRefresh
  };
}
