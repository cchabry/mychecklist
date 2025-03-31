
import { CacheOptions } from '../../types/cacheEntry';
import { CacheFetchOptions } from '../../types/fetchOptions';

/**
 * Interface for the CacheManager class
 */
export interface ICacheManager {
  fetch<T>(key: string, options: CacheFetchOptions<T>): Promise<T>;
  set<T>(key: string, value: T, ttl?: number): void;
  get<T>(key: string): T | null;
  has(key: string): boolean;
  invalidate(key: string): boolean;
  invalidateByPrefix(prefix: string): number;
  clear(): number;
  getStats(): Record<string, any>;
  cleanup(): number;
}

/**
 * Options for initializing the CacheManager
 */
export type CacheManagerOptions = Partial<CacheOptions>;
