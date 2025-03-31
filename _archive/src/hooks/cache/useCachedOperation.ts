
import { useState, useEffect, useCallback } from 'react';
import { cachingService } from '@/services/cache/cacheServiceUtility';
import { operationMode } from '@/services/operationMode';

/**
 * Hook qui simplifie l'utilisation du cache avec operationMode
 */
export function useCachedOperation<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    staleTime?: number;
    forceFresh?: boolean;
    onSuccess?: (data: T, fromCache: boolean) => void;
    onError?: (error: Error) => void;
    context?: string;
  } = {}
) {
  const {
    ttl,
    enabled = true,
    staleTime = 60 * 1000, // 1 minute par défaut pour considérer les données périmées
    forceFresh = false,
    onSuccess,
    onError,
    context = 'Opération en cache'
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  
  const fetchData = useCallback(async (silent: boolean = false): Promise<T> => {
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      const result = await cachingService.getOrFetch<T>(key, fetcher, {
        ttl,
        forceFresh,
        context,
        onSuccess: (data, fromCache) => {
          if (onSuccess && !silent) {
            onSuccess(data, fromCache);
          }
        }
      });
      
      setData(result);
      setTimestamp(Date.now());
      setIsStale(false);
      setError(null);
      
      if (!silent) {
        setIsLoading(false);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (!silent) {
        setError(error);
        setIsLoading(false);
        
        if (onError) {
          onError(error);
        }
      }
      
      throw error;
    }
  }, [key, fetcher, ttl, forceFresh, context, onSuccess, onError]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      // Vérifier le cache d'abord si on ne force pas le rafraîchissement
      if (!forceFresh) {
        const cachedData = cachingService.get<{ data: T, timestamp: number }>(key);
        
        if (cachedData && typeof cachedData === 'object' && 'data' in cachedData) {
          // Données trouvées en cache
          const cachedTimestamp = cachedData.timestamp || Date.now();
          const dataIsStale = staleTime && Date.now() - cachedTimestamp > staleTime;
          
          setData(cachedData.data);
          setTimestamp(cachedTimestamp);
          setIsStale(dataIsStale);
          setIsLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedData.data, true);
          }
          
          // Si les données sont périmées, recharger en arrière-plan
          if (dataIsStale) {
            fetchData(true).catch(error => {
              console.error(`Erreur lors du rechargement en arrière-plan pour ${key}:`, error);
            });
          }
          
          return;
        }
      }
      
      // Rien en cache ou forceFresh, charger les données
      try {
        await fetchData();
      } catch (error) {
        console.error(`Erreur lors du chargement initial des données pour ${key}:`, error);
      }
    };
    
    loadData();
  }, [key, enabled, forceFresh, staleTime, fetchData, onSuccess]);
  
  const invalidate = useCallback(() => {
    cachingService.delete(key);
  }, [key]);
  
  return {
    data,
    isLoading,
    isStale,
    error,
    timestamp,
    refetch: () => fetchData(),
    invalidate
  };
}
