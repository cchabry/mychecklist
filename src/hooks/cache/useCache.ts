
import { useContext } from 'react';
import { CacheContext } from '@/contexts/CacheContext';

// Hook simple pour accéder au service de cache
export function useCache() {
  return useContext(CacheContext);
}
