
import { useState, useEffect } from 'react';
import { cacheService } from '@/services/cache/cache';

interface CacheEntry {
  key: string;
  data: any;
  expiry: number | null;
  timestamp: number;
}

export function useCacheManager() {
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Charger les entrées du cache
  useEffect(() => {
    const loadEntries = () => {
      const entries = cacheService.getAll().filter(entry => {
        if (!searchTerm) return true;
        return entry.key.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Trier par date de création (plus récent d'abord)
      entries.sort((a, b) => b.timestamp - a.timestamp);
      
      setCacheEntries(entries);
    };
    
    loadEntries();
  }, [searchTerm, refreshTrigger]);
  
  // Refresh le cache
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Nettoyer les entrées expirées
  const handleCleanExpired = () => {
    cacheService.cleanExpired();
    handleRefresh();
  };
  
  // Supprimer une entrée
  const handleDeleteEntry = (key: string) => {
    cacheService.remove(key);
    handleRefresh();
  };
  
  // Vider tout le cache
  const handleClearAll = () => {
    cacheEntries.forEach(entry => {
      cacheService.remove(entry.key);
    });
    handleRefresh();
  };

  return {
    cacheEntries,
    searchTerm,
    setSearchTerm,
    handleRefresh,
    handleCleanExpired,
    handleDeleteEntry,
    handleClearAll
  };
}
