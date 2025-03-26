
import { Cache } from '../baseCache';

/**
 * Gets statistics about the cache
 */
export function getCacheStats(cache: Cache, options: any): Record<string, any> {
  return cache.getStats();
}

/**
 * Cleans up expired entries from the cache
 */
export function cleanupCache(cache: Cache): number {
  return cache.cleanup();
}
