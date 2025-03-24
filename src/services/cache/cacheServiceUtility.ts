
import { cacheService } from './cache';
import { operationMode } from '@/services/operationMode';
import { operationModeIntegration } from './utils/operationModeIntegration';

/**
 * Service utilitaire qui simplifie l'utilisation du cache en fonction du mode opérationnel
 */
export const cachingService = {
  /**
   * Récupère une valeur du cache ou exécute la fonction de récupération si absent/expiré
   * @param key Clé du cache
   * @param fetcher Fonction pour récupérer les données
   * @param options Options de mise en cache
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      forceFresh?: boolean;
      onSuccess?: (data: T, fromCache: boolean) => void;
      context?: string;
    } = {}
  ): Promise<T> {
    const { ttl, forceFresh = false, onSuccess, context = 'Opération de cache' } = options;
    
    // Déterminer si nous devons utiliser le cache
    const shouldUseCache = !forceFresh && this.shouldUseCache();
    
    // Si nous devons ignorer le cache
    if (!shouldUseCache) {
      try {
        const data = await fetcher();
        this.set(key, data, ttl);
        
        if (onSuccess) {
          onSuccess(data, false);
        }
        
        operationModeIntegration.reportCacheSuccess();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          operationModeIntegration.reportCacheError(error, context);
        } else {
          operationModeIntegration.reportCacheError(new Error(String(error)), context);
        }
        throw error;
      }
    }
    
    // Vérifier le cache d'abord
    try {
      return await cacheService.getOrFetch(
        key, 
        fetcher,
        operationModeIntegration.getEffectiveTTL(ttl)
      );
    } catch (error) {
      if (error instanceof Error) {
        operationModeIntegration.reportCacheError(error, context);
      } else {
        operationModeIntegration.reportCacheError(new Error(String(error)), context);
      }
      throw error;
    }
  },
  
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    if (!this.shouldUseCache()) {
      return null;
    }
    return cacheService.get<T>(key);
  },
  
  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl?: number): string {
    const effectiveTTL = operationModeIntegration.getEffectiveTTL(ttl);
    return cacheService.set(key, value, effectiveTTL);
  },
  
  /**
   * Supprime une valeur du cache
   */
  delete(key: string): boolean {
    return cacheService.delete(key);
  },
  
  /**
   * Alias pour delete
   */
  remove(key: string): boolean {
    return this.delete(key);
  },
  
  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    if (!this.shouldUseCache()) {
      return false;
    }
    return cacheService.has(key);
  },
  
  /**
   * Vide entièrement le cache
   */
  clear(): number {
    return cacheService.clear();
  },
  
  /**
   * Supprime toutes les entrées expirées du cache
   */
  cleanup(): number {
    return cacheService.cleanup();
  },
  
  /**
   * Alias pour cleanup
   */
  cleanExpired(): number {
    return this.cleanup();
  },
  
  /**
   * Détermine si le cache doit être utilisé selon le mode opérationnel
   */
  shouldUseCache(): boolean {
    return operationModeIntegration.shouldUseCache();
  },
  
  /**
   * Récupère toutes les entrées du cache
   */
  getAll() {
    return cacheService.getAll();
  },
  
  /**
   * Récupère toutes les entrées correspondant à un préfixe
   */
  getByPrefix<T>(prefix: string): [string, T][] {
    return cacheService.getByPrefix<T>(prefix);
  },
  
  /**
   * Supprime toutes les entrées correspondant à un préfixe
   */
  deleteByPrefix(prefix: string): number {
    return cacheService.deleteByPrefix(prefix);
  }
};
