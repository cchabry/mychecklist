
import { useCache } from './useCache';

/**
 * Version simplifiée du hook useCache pour les cas d'utilisation simples
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useCache<T>(key, fetcher, ttl);
}
