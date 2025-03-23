
import { useContext } from 'react';
import { CacheContext } from '@/contexts/CacheContext';

/**
 * Hook pour accéder à l'instance du gestionnaire de cache
 */
export function useCache() {
  const cacheManager = useContext(CacheContext);
  
  if (!cacheManager) {
    throw new Error('useCache doit être utilisé à l\'intérieur d\'un CacheProvider');
  }
  
  return cacheManager;
}
