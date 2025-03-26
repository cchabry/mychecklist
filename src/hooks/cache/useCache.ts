
import { useState, useEffect, useCallback } from 'react';
import { cacheService, CacheOptions } from '@/services/cache/cacheService';

/**
 * Hook pour utiliser le service de cache
 */
export function useCache<T>(key: string, initialValue?: T, options?: CacheOptions) {
  const [data, setData] = useState<T | undefined>(() => {
    // Tenter de récupérer la valeur du cache au démarrage
    const cached = cacheService.get<T>(key);
    return cached !== undefined ? cached : initialValue;
  });

  // Charger les données du cache
  useEffect(() => {
    const cached = cacheService.get<T>(key);
    if (cached !== undefined) {
      setData(cached);
    }
  }, [key]);

  // Mettre à jour les données dans le cache
  const updateCache = useCallback((value: T) => {
    setData(value);
    cacheService.set(key, value, options);
  }, [key, options]);

  // Supprimer les données du cache
  const clearCache = useCallback(() => {
    setData(undefined);
    cacheService.delete(key);
  }, [key]);

  // Rafraîchir avec une nouvelle valeur
  const refreshWith = useCallback(async (getValue: () => Promise<T>) => {
    try {
      const newValue = await getValue();
      updateCache(newValue);
      return newValue;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du cache', error);
      return data;
    }
  }, [data, updateCache]);

  // Charger ou définir
  const getOrSet = useCallback(async (getValue: () => Promise<T>) => {
    try {
      const result = await cacheService.getOrSet(key, getValue, options);
      setData(result);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'opération getOrSet', error);
      return data;
    }
  }, [key, data, options]);

  return {
    data,
    updateCache,
    clearCache,
    refreshWith,
    getOrSet
  };
}
