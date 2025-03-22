
import { useCache } from './useCache';

/**
 * Hook pour utiliser le cache avec la stratégie stale-while-revalidate
 */
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useCache<T>(key, fetcher, { 
    staleWhileRevalidate: true,
    ttl
  });
}
