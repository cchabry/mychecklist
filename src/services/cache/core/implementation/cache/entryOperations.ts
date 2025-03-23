
/**
 * Operations sur les entrées du cache
 */

import { hasExpired } from '../expiryUtils';
import { CacheStorage } from '../CacheStorage';

/**
 * Récupère toutes les entrées du cache
 */
export function getAllEntries(
  storage: CacheStorage,
  getOriginalKey: (fullKey: string) => string
): Array<{key: string, data: any, expiry: number | null, timestamp: number}> {
  const entries: Array<{key: string, data: any, expiry: number | null, timestamp: number}> = [];
  
  for (const [fullKey, entry] of storage.entries()) {
    // Vérifier l'expiration
    if (hasExpired(entry)) {
      storage.delete(fullKey);
      continue;
    }
    
    // Ajouter à la liste
    entries.push({
      key: getOriginalKey(fullKey),
      data: entry.data,
      expiry: entry.expiry,
      timestamp: entry.timestamp
    });
  }
  
  return entries;
}
