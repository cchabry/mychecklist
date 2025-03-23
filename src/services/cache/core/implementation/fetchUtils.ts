
/**
 * Utilitaires pour les opérations de récupération de données
 */

import { Cache } from './cache/Cache';

/**
 * Récupère une valeur depuis le cache ou depuis la source si absente/expirée
 */
export async function fetchFromCacheOrSource<T>(
  cache: Cache,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  logger?: (message: string, data?: any) => void
): Promise<T> {
  // Tenter de récupérer depuis le cache
  const cachedValue = cache.get<T>(key);
  
  // Si trouvé, retourner directement
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // Sinon, exécuter le fetcher et mettre en cache
  try {
    const freshValue = await fetcher();
    cache.set(key, freshValue, ttl);
    return freshValue;
  } catch (error) {
    if (logger) {
      logger(`Erreur lors du chargement des données pour: ${key}`, error);
    }
    throw error;
  }
}
