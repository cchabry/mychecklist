
/**
 * Core implementation of the cache manager system
 */

import { Cache } from './baseCache';
import { CacheOptions } from '../types/cacheEntry';
import { CacheFetchOptions } from '../types/fetchOptions';
import { logCacheEvent } from '../utils/logger';
import { executeFetcher, refreshInBackground } from './operations/fetchOperations';
import { getCacheStats, cleanupCache } from './operations/cacheStats';
import { ICacheManager, CacheManagerOptions } from './types/managerTypes';

/**
 * Cache manager class that provides advanced caching capabilities
 */
export class CacheManager implements ICacheManager {
  private cache: Cache;
  private pendingFetches: Map<string, Promise<any>>;
  private debug: boolean;
  
  constructor(options?: CacheManagerOptions) {
    this.cache = new Cache(options);
    this.pendingFetches = new Map();
    this.debug = options?.debug || false;
  }
  
  /**
   * Fetches a value from the cache or retrieves it via the fetcher
   * Supports stale-while-revalidate strategy and callbacks
   */
  async fetch<T>(
    key: string,
    options: CacheFetchOptions<T>
  ): Promise<T> {
    const {
      fetcher,
      ttl,
      skipCache = false,
      staleWhileRevalidate = false,
      onSuccess,
      onError,
      onLoading
    } = options;
    
    // Signal loading start
    if (onLoading) {
      onLoading(true);
    }
    
    try {
      // Check if cache should be skipped
      if (skipCache) {
        // Execute the fetcher directly
        const freshData = await executeFetcher<T>(
          this.pendingFetches, 
          key, 
          fetcher, 
          this.debug
        );
        
        // Cache the result
        this.cache.set(key, freshData, ttl);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(freshData, false);
        }
        
        // Signal loading end
        if (onLoading) {
          onLoading(false);
        }
        
        return freshData;
      }
      
      // Check if cached data is available
      const cachedData = this.cache.get<T>(key);
      
      // If data is in cache
      if (cachedData !== null) {
        // If stale-while-revalidate is enabled, refresh in background
        if (staleWhileRevalidate) {
          // Refresh in background
          this.refreshInBackground<T>(key, fetcher, ttl, onSuccess);
        }
        
        // Call success callback with cached data
        if (onSuccess) {
          onSuccess(cachedData, true);
        }
        
        // Signal loading end
        if (onLoading) {
          onLoading(false);
        }
        
        return cachedData;
      }
      
      // No cached data, execute the fetcher
      const freshData = await executeFetcher<T>(
        this.pendingFetches, 
        key, 
        fetcher, 
        this.debug
      );
      
      // Cache the result
      this.cache.set(key, freshData, ttl);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(freshData, false);
      }
      
      return freshData;
    } catch (error) {
      // Call error callback
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      throw error;
    } finally {
      // Signal loading end in all cases
      if (onLoading) {
        onLoading(false);
      }
    }
  }
  
  /**
   * Refreshes cache data in the background
   */
  private refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    onSuccess?: (data: T, fromCache: boolean) => void
  ): void {
    refreshInBackground(
      key, 
      fetcher, 
      this.set.bind(this), 
      ttl, 
      onSuccess, 
      this.debug
    );
  }
  
  /**
   * Sets a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }
  
  /**
   * Gets a value from the cache
   */
  get<T>(key: string): T | null {
    return this.cache.get<T>(key);
  }
  
  /**
   * Checks if a key exists in the cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Removes an entry from the cache
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Removes all entries matching a prefix
   */
  invalidateByPrefix(prefix: string): number {
    return this.cache.deleteByPrefix(prefix);
  }
  
  /**
   * Clears the entire cache
   */
  clear(): number {
    return this.cache.clear();
  }
  
  /**
   * Gets statistics about the cache
   */
  getStats(): Record<string, any> {
    return getCacheStats(this.cache, this.debug);
  }
  
  /**
   * Removes all expired entries from the cache
   */
  cleanup(): number {
    return cleanupCache(this.cache);
  }
  
  /**
   * Logs a message if debug mode is enabled
   */
  private log(message: string, data?: any): void {
    logCacheEvent(this.debug, message, data);
  }
}
