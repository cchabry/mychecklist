
import React, { createContext, useContext, ReactNode } from 'react';
import { cacheManager } from '@/services/cache/cacheManager';
import { cacheService } from '@/services/cache/cache';
import { projectsCache, auditsCache, pagesCache, checklistsCache } from '@/services/cache/utils';

// Définir l'interface du contexte
interface CacheContextValue {
  // Services de base
  cacheManager: typeof cacheManager;
  cacheService: typeof cacheService;
  
  // Caches spécifiques aux entités
  projectsCache: typeof projectsCache;
  auditsCache: typeof auditsCache;
  pagesCache: typeof pagesCache;
  checklistsCache: typeof checklistsCache;
  
  // Actions
  clearAllCaches: () => void;
  clearEntityCache: (entityName: string) => number;
}

// Créer le contexte
const CacheContext = createContext<CacheContextValue | undefined>(undefined);

// Props pour le fournisseur
interface CacheProviderProps {
  children: ReactNode;
}

// Composant fournisseur
export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
  // Nettoyer tous les caches
  const clearAllCaches = () => {
    projectsCache.invalidateAll();
    auditsCache.invalidateAll();
    pagesCache.invalidateAll();
    checklistsCache.invalidateAll();
  };
  
  // Nettoyer un cache spécifique
  const clearEntityCache = (entityName: string): number => {
    switch (entityName) {
      case 'projects':
        return projectsCache.invalidateAll();
      case 'audits':
        return auditsCache.invalidateAll();
      case 'pages':
        return pagesCache.invalidateAll();
      case 'checklists':
        return checklistsCache.invalidateAll();
      default:
        return cacheManager.invalidateByPrefix(`entity:${entityName}`);
    }
  };
  
  // Valeur du contexte
  const value: CacheContextValue = {
    cacheManager,
    cacheService,
    projectsCache,
    auditsCache,
    pagesCache,
    checklistsCache,
    clearAllCaches,
    clearEntityCache
  };
  
  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useAppCache = (): CacheContextValue => {
  const context = useContext(CacheContext);
  
  if (context === undefined) {
    throw new Error('useAppCache must be used within a CacheProvider');
  }
  
  return context;
};
