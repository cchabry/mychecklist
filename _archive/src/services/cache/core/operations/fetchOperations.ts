
import { logCacheEvent } from '../../utils/logger';

/**
 * Executes a fetcher with deduplication of simultaneous requests
 */
export async function executeFetcher<T>(
  pendingFetches: Map<string, Promise<any>>,
  key: string,
  fetcher: () => Promise<T>,
  debug: boolean
): Promise<T> {
  // Check if a request is already in progress for this key
  const pendingFetch = pendingFetches.get(key);
  
  if (pendingFetch) {
    // Reuse the existing promise
    return pendingFetch as Promise<T>;
  }
  
  // Create a new promise
  const fetchPromise = fetcher();
  
  // Register the pending promise
  pendingFetches.set(key, fetchPromise);
  
  try {
    // Wait for the result
    const result = await fetchPromise;
    return result;
  } finally {
    // Remove the pending promise
    pendingFetches.delete(key);
  }
}

/**
 * Refreshes cache data in the background
 */
export async function refreshInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  setCache: (key: string, value: T, ttl?: number) => void,
  ttl?: number,
  onSuccess?: (data: T, fromCache: boolean) => void,
  debug: boolean = false
): Promise<void> {
  try {
    // Execute the fetcher
    const freshData = await fetcher();
    
    // Update the cache
    setCache(key, freshData, ttl);
    
    // Call the callback if needed
    if (onSuccess) {
      onSuccess(freshData, false);
    }
  } catch (error) {
    // Ignore background errors, they will be handled
    // during the next explicit request
    logCacheEvent(debug, `Error during background refresh for ${key}:`, error);
  }
}
