
/**
 * Operations de nettoyage du cache
 */

import { hasExpired } from './expiryOperations';
import { CacheStorage } from '../CacheStorage';

/**
 * Nettoie les entrées expirées du cache
 */
export function cleanupEntries(storage: CacheStorage): number {
  const now = Date.now();
  let count = 0;
  
  // Parcourir toutes les entrées
  for (const [key, entry] of storage.entries()) {
    if (entry.expiry !== null && entry.expiry < now) {
      storage.delete(key);
      count++;
    }
  }
  
  return count;
}
