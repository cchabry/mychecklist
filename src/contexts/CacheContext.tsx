
import React, { createContext, useContext } from 'react';
import { cacheService } from '@/services/cache/cache';

// Contexte pour le service de cache
export const CacheContext = createContext(cacheService);

// Provider pour le service de cache
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CacheContext.Provider value={cacheService}>
      {children}
    </CacheContext.Provider>
  );
};

