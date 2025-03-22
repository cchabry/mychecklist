
import { useCache } from './useCache';

/**
 * Version simplifiée du hook useCache pour les cas d'utilisation simples
 * @param key - Clé d'identification dans le cache
 * @param fetcher - Fonction pour récupérer les données si absentes ou expirées
 * @param ttl - Durée de vie en ms
 * @returns Objet avec données, état, et fonctions de contrôle
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useCache<T>(key, fetcher, ttl);
}
