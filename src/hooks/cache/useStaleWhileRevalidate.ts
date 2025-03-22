
import { useCache } from './useCache';
import type { CacheFetchOptions } from '@/services/cache/types';

/**
 * Hook pour utiliser le cache avec la stratégie stale-while-revalidate
 * @param key - Clé d'identification dans le cache
 * @param fetcher - Fonction pour récupérer les données si absentes ou expirées
 * @param ttl - Durée de vie en ms ou options avancées
 * @returns Objet avec données, état, et fonctions de contrôle
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number | Omit<CacheFetchOptions<T>, 'fetcher' | 'staleWhileRevalidate'>
) {
  const options: Omit<CacheFetchOptions<T>, 'fetcher'> = typeof ttl === 'number' 
    ? { ttl, staleWhileRevalidate: true } 
    : { ...ttl, staleWhileRevalidate: true };
    
  return useCache<T>(key, fetcher, options);
}
