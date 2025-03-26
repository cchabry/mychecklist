
/**
 * Point d'entrée pour les hooks de cache
 * Re-export depuis le dossier cache pour maintenir la compatibilité
 */
import { useCache as useCacheInternal } from './cache/useCache';
import { useCachedData } from './cache/useCachedData';
import { useStaleWhileRevalidate } from './cache/useStaleWhileRevalidate';
import { useCachedOperation } from './cache/useCachedOperation';

export { 
  useCacheInternal as useCache, 
  useCachedData, 
  useStaleWhileRevalidate,
  useCachedOperation
};
