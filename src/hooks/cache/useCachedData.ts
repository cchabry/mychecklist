
import { useState, useEffect } from 'react';
import { useCache } from './useCache';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour récupérer des données en cache avec chargement automatique
 * 
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
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { ttl, enabled = true, onSuccess, onError } = options;
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // Déterminer le TTL effectif selon le mode opérationnel
  const effectiveTTL = operationMode.isDemoMode 
    ? (ttl || 15 * 60 * 1000)  // 15 min en mode démo
    : (ttl || 5 * 60 * 1000);  // 5 min en mode réel

  useEffect(() => {
    if (!enabled) return;

    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Vérifier le cache d'abord
        const cachedData = cache.get(key);
        
        if (cachedData && typeof cachedData === 'object' && 'data' in cachedData) {
          setData(cachedData.data as T);
          setTimestamp(cachedData.timestamp as number || null);
          setIsLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedData.data as T);
          }
          return;
        }
        
        // Rien en cache, charger les données
        const result = await fetcher();
        
        // Sauvegarder dans le cache
        const now = Date.now();
        cache.set(key, { 
          data: result,
          timestamp: now
        }, effectiveTTL);
        
        setData(result);
        setTimestamp(now);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Signaler l'opération réussie
        operationMode.handleSuccessfulOperation();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        // Signaler l'erreur au système operationMode
        operationMode.handleConnectionError(error, `Chargement des données pour ${key}`);
        
        console.error(`Erreur lors du chargement des données pour la clé ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, enabled, cache, fetcher, effectiveTTL, onSuccess, onError]);

  const refetch = async () => {
    setIsLoading(true);
    
    try {
      const result = await fetcher();
      
      // Sauvegarder dans le cache
      const now = Date.now();
      cache.set(key, { 
        data: result,
        timestamp: now 
      }, effectiveTTL);
      
      setData(result);
      setTimestamp(now);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(error, `Rechargement des données pour ${key}`);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const invalidate = () => {
    cache.delete(key);
  };

  return { 
    data, 
    isLoading, 
    error, 
    timestamp,
    refetch,
    invalidate
  };
}
