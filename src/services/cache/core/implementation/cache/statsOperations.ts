
/**
 * Operations pour obtenir des statistiques sur le cache
 */

import { CacheOptions } from '../../types/cacheEntry';
import { CacheStorage } from '../CacheStorage';

/**
 * Obtient des statistiques sur le cache
 */
export function getCacheStats(
  storage: CacheStorage, 
  options: CacheOptions,
  now: number
): Record<string, any> {
  let expiredCount = 0;
  let validCount = 0;
  let noExpiryCount = 0;
  
  for (const entry of storage.values()) {
    if (entry.expiry === null) {
      noExpiryCount++;
    } else if (entry.expiry < now) {
      expiredCount++;
    } else {
      validCount++;
    }
  }
  
  return {
    total: storage.size(),
    valid: validCount,
    expired: expiredCount,
    noExpiry: noExpiryCount,
    options: options
  };
}
