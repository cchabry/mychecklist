
/**
 * Hook pour accéder aux fonctionnalités d'optimisation Notion
 */

import { useState, useCallback } from 'react';
import { 
  notionResponseCompressor,
  generateCacheKey,
  isRequestCachable,
  shouldInvalidateCache,
  getOptimalTTL
} from '@/services/notion/optimization';
import { cachingService } from '@/services/cache/cacheServiceUtility';

/**
 * Hook pour gérer les performances des requêtes Notion
 */
export function useNotionPerformance() {
  const [compressionStats, setCompressionStats] = useState<{
    totalSaved: number;
    totalCompressed: number;
    averageSavings: number;
  }>({
    totalSaved: 0,
    totalCompressed: 0,
    averageSavings: 0
  });
  
  /**
   * Compresse une réponse Notion et met à jour les statistiques
   */
  const compressResponse = useCallback(<T>(response: T): T => {
    if (!response || typeof response !== 'object') {
      return response;
    }
    
    // Mesurer la taille avant compression
    const beforeSize = JSON.stringify(response).length;
    
    // Comprimer la réponse
    const compressed = notionResponseCompressor.compressResponse(response);
    
    // Mesurer la taille après compression
    const afterSize = JSON.stringify(compressed).length;
    
    // Mettre à jour les statistiques
    const bytesSaved = Math.max(0, beforeSize - afterSize);
    
    setCompressionStats(prev => {
      const newTotalSaved = prev.totalSaved + bytesSaved;
      const newTotalCompressed = prev.totalCompressed + 1;
      
      return {
        totalSaved: newTotalSaved,
        totalCompressed: newTotalCompressed,
        averageSavings: newTotalCompressed > 0 
          ? newTotalSaved / newTotalCompressed 
          : 0
      };
    });
    
    return compressed;
  }, []);
  
  /**
   * Cache une réponse Notion avec un TTL optimal
   */
  const cacheResponse = useCallback(<T>(
    endpoint: string,
    method: string,
    response: T,
    queryParams?: Record<string, any>,
    bodyData?: Record<string, any>
  ): void => {
    // Vérifier si la requête est cachable
    if (!isRequestCachable(method, endpoint, bodyData)) {
      return;
    }
    
    // Générer la clé de cache
    const cacheKey = generateCacheKey(endpoint, method, queryParams, bodyData);
    
    // Déterminer le TTL optimal
    const ttl = getOptimalTTL('notion', endpoint);
    
    // Stocker dans le cache
    cachingService.set(cacheKey, response, ttl);
    
    console.log(`[NotionPerformance] Réponse mise en cache: ${cacheKey} (TTL: ${ttl/1000}s)`);
  }, []);
  
  /**
   * Récupère une réponse du cache si disponible
   */
  const getCachedResponse = useCallback(<T>(
    endpoint: string,
    method: string,
    queryParams?: Record<string, any>,
    bodyData?: Record<string, any>
  ): T | null => {
    // Vérifier si la requête est cachable
    if (!isRequestCachable(method, endpoint, bodyData)) {
      return null;
    }
    
    // Générer la clé de cache
    const cacheKey = generateCacheKey(endpoint, method, queryParams, bodyData);
    
    // Récupérer du cache
    const cached = cachingService.get<T>(cacheKey);
    
    if (cached) {
      console.log(`[NotionPerformance] Réponse récupérée du cache: ${cacheKey}`);
    }
    
    return cached;
  }, []);
  
  /**
   * Invalide les entrées de cache concernées par une modification
   */
  const invalidateCache = useCallback((
    endpoint: string,
    method: string
  ): void => {
    // Déterminer les patterns d'invalidation
    const patterns = shouldInvalidateCache(method, endpoint);
    
    if (patterns.length === 0) {
      return;
    }
    
    // Invalider les entrées correspondantes
    let invalidatedCount = 0;
    
    patterns.forEach(pattern => {
      // Vérifier si c'est un pattern exact ou un préfixe
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        const count = cachingService.deleteByPrefix(prefix);
        invalidatedCount += count;
      } else {
        // Entrée exacte
        if (cachingService.delete(pattern)) {
          invalidatedCount++;
        }
      }
    });
    
    if (invalidatedCount > 0) {
      console.log(`[NotionPerformance] Cache invalidé: ${invalidatedCount} entrée(s) pour ${method} ${endpoint}`);
    }
  }, []);
  
  return {
    compressResponse,
    cacheResponse,
    getCachedResponse,
    invalidateCache,
    compressionStats
  };
}
