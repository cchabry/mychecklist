
import { useState, useEffect, useCallback } from 'react';
import { QueryOptions } from './types';

/**
 * Hook générique pour gérer les appels de service avec mise en cache
 */
export function useServiceWithCache<T>(
  fetchData: () => Promise<T>,
  options: QueryOptions = {}
) {
  const { 
    cacheKey, 
    immediate = true, 
    cacheTTL = 5 * 60 * 1000, // 5 minutes par défaut
    onSuccess,
    onError
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;
    
    try {
      const cachedDataStr = localStorage.getItem(`cache_${cacheKey}`);
      if (!cachedDataStr) return null;
      
      const { data, timestamp } = JSON.parse(cachedDataStr);
      const now = Date.now();
      
      // Vérifier si le cache est expiré
      if (now - timestamp > cacheTTL) {
        localStorage.removeItem(`cache_${cacheKey}`);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Erreur lors de la récupération du cache:', err);
      return null;
    }
  }, [cacheKey, cacheTTL]);
  
  const setCachedData = useCallback((data: T) => {
    if (!cacheKey) return;
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Erreur lors de la mise en cache des données:', err);
    }
  }, [cacheKey]);
  
  const invalidateCache = useCallback(() => {
    if (!cacheKey) return;
    
    try {
      localStorage.removeItem(`cache_${cacheKey}`);
      console.log(`Cache invalidé: ${cacheKey}`);
    } catch (err) {
      console.error('Erreur lors de l\'invalidation du cache:', err);
    }
  }, [cacheKey]);
  
  const executeQuery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Vérifier le cache
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      if (onSuccess) onSuccess(cachedData);
      return cachedData;
    }
    
    try {
      const result = await fetchData();
      setData(result);
      setCachedData(result);
      
      if (onSuccess) onSuccess(result);
      
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      
      if (onError) onError(error);
      
      return null;
    }
  }, [fetchData, getCachedData, setCachedData, onSuccess, onError]);
  
  const reload = useCallback(() => {
    invalidateCache();
    return executeQuery();
  }, [invalidateCache, executeQuery]);
  
  // Exécuter la requête au montage du composant si demandé
  useEffect(() => {
    if (immediate) {
      executeQuery();
    }
  }, [immediate, executeQuery]);
  
  return {
    data,
    isLoading,
    error,
    fetchData: executeQuery,
    invalidateCache,
    reload
  };
}
