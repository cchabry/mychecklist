
import React, { createContext, useContext, ReactNode } from 'react';
import { Cache } from '@/services/cache/cache';
import { cacheService } from '@/services/cache/cache';

interface CacheContextType {
  cache: Cache;
}

const CacheContext = createContext<CacheContextType>({
  cache: cacheService
});

export interface CacheProviderProps {
  children: ReactNode;
  cache?: Cache;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({ 
  children, 
  cache = cacheService 
}) => {
  return (
    <CacheContext.Provider value={{ cache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  return useContext(CacheContext).cache;
};

export default CacheContext;
