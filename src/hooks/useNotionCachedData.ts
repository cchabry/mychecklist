
import { useState, useEffect, useCallback } from 'react';
import { useCache } from './cache/useCache';
import { useNotionAPI, NotionAPIOptions } from './notion/useNotionAPI';
import { operationMode } from '@/services/operationMode';

/**
 * Options pour useNotionCachedData, combinant les options de l'API Notion
 * et les options de mise en cache
 */
interface NotionCachedDataOptions<T> extends Omit<NotionAPIOptions, 'onSuccess' | 'onError'> {
  // Options de cache
  ttl?: number;
  staleTime?: number;
  skipCache?: boolean;
  staleWhileRevalidate?: boolean;
  
  // Callbacks
  onSuccess?: (data: T, fromCache: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook qui combine l'API Notion avec le système de cache
 * pour optimiser les performances et réduire les appels API
 */
export function useNotionCachedData<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  options: NotionCachedDataOptions<T> = {}
) {
  const {
    // Options de cache
    ttl,
    staleTime = 60 * 1000, // 1 minute par défaut
    skipCache = false,
    staleWhileRevalidate = true,
    
    // Callbacks
    onSuccess,
    onError,
    
    // Autres options pour l'API Notion
    ...notionOptions
  } = options;
  
  // Générer une clé de cache basée sur l'endpoint, la méthode et le corps
  const cacheKey = `notion:${method}:${endpoint}:${JSON.stringify(body || {})}`;
  
  const cache = useCache();
  const { execute, isLoading: isApiLoading } = useNotionAPI<T>();
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // Déterminer le TTL effectif selon le mode opérationnel
  const effectiveTTL = operationMode.isDemoMode 
    ? (ttl || 15 * 60 * 1000)  // 15 min en mode démo
    : (ttl || 5 * 60 * 1000);  // 5 min en mode réel

  // Fonction pour exécuter l'appel API Notion
  const fetchFromNotion = useCallback(async (silent: boolean = false): Promise<T> => {
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      // Appel à l'API Notion
      const result = await execute<T>(endpoint, method, body, undefined, {
        ...notionOptions,
        // Ces handlers sont gérés par ce hook
      });
      
      // Sauvegarder dans le cache
      const now = Date.now();
      cache.set(cacheKey, {
        data: result,
        timestamp: now
      }, effectiveTTL);
      
      // Mettre à jour l'état
      setData(result);
      setTimestamp(now);
      setIsStale(false);
      setError(null);
      
      // Appeler le callback onSuccess
      if (onSuccess && !silent) {
        onSuccess(result, false);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (!silent) {
        setError(error);
        
        // Appeler le callback onError
        if (onError) {
          onError(error);
        }
      }
      
      throw error;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [
    endpoint, 
    method, 
    body, 
    cache, 
    cacheKey, 
    effectiveTTL, 
    execute, 
    notionOptions, 
    onSuccess, 
    onError
  ]);

  // Effet pour charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      // Si skipCache est activé, contourner le cache
      if (skipCache) {
        try {
          await fetchFromNotion();
        } catch (error) {
          console.error('Erreur lors du chargement depuis Notion:', error);
        }
        return;
      }
      
      // Vérifier le cache
      const cachedEntry = cache.get<{ data: T, timestamp: number }>(cacheKey);
      
      if (cachedEntry && 'data' in cachedEntry) {
        // Vérifier si les données sont périmées
        const cachedTimestamp = cachedEntry.timestamp || 0;
        const isDataStale = staleTime && (Date.now() - cachedTimestamp) > staleTime;
        
        // Utiliser les données du cache
        setData(cachedEntry.data);
        setTimestamp(cachedTimestamp);
        setIsStale(isDataStale);
        setIsLoading(false);
        
        // Appeler le callback onSuccess
        if (onSuccess) {
          onSuccess(cachedEntry.data, true);
        }
        
        // Si les données sont périmées et staleWhileRevalidate est activé, recharger en arrière-plan
        if (isDataStale && staleWhileRevalidate) {
          fetchFromNotion(true).catch(error => {
            console.error('Erreur lors du rechargement en arrière-plan:', error);
          });
        }
      } else {
        // Rien en cache, charger les données depuis l'API
        try {
          await fetchFromNotion();
        } catch (error) {
          console.error('Erreur lors du chargement depuis Notion:', error);
        }
      }
    };
    
    loadData();
  }, [
    cacheKey, 
    skipCache, 
    staleTime, 
    staleWhileRevalidate, 
    cache, 
    fetchFromNotion, 
    onSuccess
  ]);

  // Fonction pour forcer le rechargement
  const refetch = useCallback(() => fetchFromNotion(), [fetchFromNotion]);

  return {
    data,
    isLoading,
    isStale,
    error,
    timestamp,
    refetch
  };
}
