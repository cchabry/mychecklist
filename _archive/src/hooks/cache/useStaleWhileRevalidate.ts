
import { useState, useEffect, useCallback } from 'react';
import { useCache } from './useCache';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour utiliser le pattern Stale-While-Revalidate
 * Renvoie les données du cache immédiatement (même si périmées),
 * puis rafraîchit en arrière-plan
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleTime?: number;
    enabled?: boolean;
    onSuccess?: (data: T, fromCache: boolean) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    ttl,
    staleTime = 60 * 1000, // 1 minute par défaut
    enabled = true,
    onSuccess,
    onError
  } = options;
  
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  
  // Déterminer le TTL effectif selon le mode opérationnel
  const effectiveTTL = operationMode.isDemoMode 
    ? (ttl || 15 * 60 * 1000)  // 15 min en mode démo
    : (ttl || 5 * 60 * 1000);  // 5 min en mode réel
  
  const fetchData = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      const result = await fetcher();
      
      // Mettre à jour le cache
      const now = Date.now();
      cache.set(key, {
        data: result,
        timestamp: now
      }, effectiveTTL);
      
      setData(result);
      setTimestamp(now);
      setIsStale(false);
      
      if (onSuccess && !silent) {
        onSuccess(result, false);
      }
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (!silent) {
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        // Signaler l'erreur
        operationMode.handleConnectionError(error, `Chargement des données pour ${key}`);
      }
      
      throw error;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [key, fetcher, cache, effectiveTTL, onSuccess, onError]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Vérifier le cache d'abord
        const cachedEntry = cache.get<{ data: T, timestamp: number }>(key);
        
        if (cachedEntry && typeof cachedEntry === 'object' && 'data' in cachedEntry) {
          // Déterminer si les données sont "stale"
          const cachedTimestamp = cachedEntry.timestamp || 0;
          const dataIsStale = (Date.now() - cachedTimestamp) > staleTime;
          
          // Mettre à jour l'état avec les données du cache
          setData(cachedEntry.data);
          setTimestamp(cachedTimestamp);
          setIsStale(dataIsStale);
          setIsLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedEntry.data, true);
          }
          
          // Si les données sont périmées, recharger en arrière-plan
          if (dataIsStale) {
            fetchData(true).catch(error => {
              console.error(`Erreur lors du rechargement en arrière-plan pour ${key}:`, error);
            });
          }
          
          return;
        }
        
        // Rien en cache, chercher les données
        await fetchData();
      } catch (error) {
        console.error(`Erreur lors du chargement initial pour ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [key, enabled, staleTime, cache, fetchData, onSuccess]);
  
  return {
    data,
    isLoading,
    isStale,
    error,
    timestamp,
    refetch: fetchData
  };
}
