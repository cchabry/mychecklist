
import { useState, useEffect, useCallback } from 'react';
import { useCache } from './useCache';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour implémenter la stratégie "stale-while-revalidate"
 * Retourne les données du cache même si périmées, et recharge en arrière-plan
 * 
 * @param key Clé de cache
 * @param fetcher Fonction pour récupérer les données
 * @param options Options de configuration
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleTime?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // Déterminer le TTL effectif selon le mode opérationnel
  const effectiveTTL = operationMode.isDemoMode 
    ? (ttl || 15 * 60 * 1000)  // 15 min en mode démo
    : (ttl || 5 * 60 * 1000);  // 5 min en mode réel

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
      }, effectiveTTL);
      
      // Mettre à jour l'état React
      setData(result);
      setTimestamp(Date.now());
      setIsStale(false);
      setError(null);
      
      // Appeler le callback onSuccess
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Signaler l'opération réussie
      if (!background) {
        operationMode.handleSuccessfulOperation();
      }
      
      return result;
    } catch (err) {
      // Formater l'erreur
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Mettre à jour l'état d'erreur React
      setError(error);
      
      // Appeler le callback onError
      if (onError) {
        onError(error);
      }
      
      // Signaler l'erreur au système operationMode
      if (!background) {
        operationMode.handleConnectionError(error, `Chargement des données pour ${key}`);
      }
      
      throw error;
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [key, fetcher, cache, effectiveTTL, onSuccess, onError]);

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
        setTimestamp(cachedEntry.timestamp);
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

  // Fonction pour forcer le rechargement
  const refetch = useCallback(() => fetchData(false), [fetchData]);

  return {
    data,
    isLoading,
    isStale,
    error,
    timestamp,
    refetch
  };
}
