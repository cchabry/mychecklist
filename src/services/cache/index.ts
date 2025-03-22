
/**
 * Point d'entrée central pour le système de cache
 */

// Exporter le service de cache de base
export { cacheService, Cache } from './cache';

// Exporter le gestionnaire de cache avancé
export { cacheManager, CacheManager } from './cacheManager';

// Exporter les types
export type { 
  CacheEntry, 
  CacheOptions, 
  CacheFetchOptions 
} from './types';

// Exporter les utilitaires
export * from './utils';
