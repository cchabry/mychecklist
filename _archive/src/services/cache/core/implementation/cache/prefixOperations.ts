
/**
 * Operations liées aux préfixes de clés
 */

import { hasExpired } from './expiryOperations';
import { CacheStorage } from '../CacheStorage';

/**
 * Récupère toutes les entrées correspondant à un préfixe
 */
export function getByPrefix<T>(
  storage: CacheStorage,
  prefix: string,
  getFullKey: (key: string) => string,
  getOriginalKey: (fullKey: string) => string
): [string, T][] {
  const fullPrefix = getFullKey(prefix);
  const result: [string, T][] = [];
  
  for (const [key, entry] of storage.entries()) {
    // Vérifier le préfixe
    if (!key.startsWith(fullPrefix)) {
      continue;
    }
    
    // Vérifier l'expiration
    if (hasExpired(entry)) {
      storage.delete(key);
      continue;
    }
    
    // Ajouter au résultat (en supprimant le préfixe global)
    const originalKey = getOriginalKey(key);
    result.push([originalKey, entry.data]);
  }
  
  return result;
}

/**
 * Supprime toutes les entrées correspondant à un préfixe
 */
export function deleteByPrefix(
  storage: CacheStorage,
  prefix: string,
  getFullKey: (key: string) => string
): number {
  const fullPrefix = getFullKey(prefix);
  let count = 0;
  
  for (const key of storage.keys()) {
    if (key.startsWith(fullPrefix)) {
      storage.delete(key);
      count++;
    }
  }
  
  return count;
}
