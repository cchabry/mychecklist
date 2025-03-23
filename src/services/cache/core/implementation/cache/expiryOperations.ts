
/**
 * Utilitaires pour la gestion des expirations du cache
 */

import { CacheEntry } from '../../../types/cacheEntry';
import { CacheStorage } from '../CacheStorage';

/**
 * Vérifie si une entrée de cache est expirée
 */
export function hasExpired<T>(entry: CacheEntry<T>): boolean {
  return entry.expiry !== null && entry.expiry < Date.now();
}

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
