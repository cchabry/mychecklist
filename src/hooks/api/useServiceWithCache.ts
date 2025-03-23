
import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '@/services/cache/cache';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
  forceRefresh?: boolean;
  staleWhileRevalidate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export function useServiceWithCache<T>(
  serviceMethod: (...args: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode } = useOperationModeListener();

  const {
    enabled = true,
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    forceRefresh = false,
    staleWhileRevalidate = true,
    onError,
    onSuccess
  } = options;

  // Générer une clé de cache basée sur le nom de la méthode et les dépendances
  const getCacheKey = useCallback(() => {
    const methodName = serviceMethod.name || 'unknownMethod';
    const depsString = dependencies.map(dep => 
      typeof dep === 'object' ? JSON.stringify(dep) : String(dep)
    ).join('-');
    return `${methodName}:${depsString}`;
  }, [serviceMethod, dependencies]);

  // Fonction pour exécuter le service
  const fetchData = useCallback(async (skipCache = false) => {
    const cacheKey = getCacheKey();
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier le cache si on ne force pas un refresh
      if (!skipCache && !forceRefresh) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedData);
          }
          
          // Si staleWhileRevalidate est activé, mettre à jour les données en arrière-plan
          if (staleWhileRevalidate) {
            setTimeout(() => fetchData(true), 0);
          }
          
          return;
        }
      }

      // Appeler le service avec les dépendances
      const result = await serviceMethod(...dependencies);
      
      // Mettre en cache les résultats
      if (result && cacheKey) {
        cacheService.set(cacheKey, result, ttl);
      }
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    serviceMethod, 
    dependencies, 
    getCacheKey, 
    forceRefresh, 
    staleWhileRevalidate,
    ttl,
    onSuccess,
    onError
  ]);

  // Rafraîchir les données lorsque les dépendances changent
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, ...dependencies, isDemoMode]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => cacheService.remove(getCacheKey())
  };
}
