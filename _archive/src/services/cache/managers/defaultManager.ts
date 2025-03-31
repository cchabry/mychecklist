
/**
 * Exports the default cache manager instance
 */

import { CacheManager } from '../core/cacheManager';

// Exporter une instance par défaut
export const cacheManager = new CacheManager({
  debug: process.env.NODE_ENV === 'development',
  keyPrefix: 'app-cache:v1:'
});
