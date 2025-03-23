
/**
 * Core cache functionality exports
 */

// Export the main cache manager class
export { CacheManager } from './cacheManager';

// Export cache base implementations
export { Cache, hasExpired } from './baseCache';

// Export types
export { ICacheManager, CacheManagerOptions } from './types/managerTypes';

// Export operations
export { executeFetcher, refreshInBackground } from './operations/fetchOperations';
export { getCacheStats, cleanupCache } from './operations/cacheStats';
