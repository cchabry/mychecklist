
import { cacheService } from './cache';
import { CacheOptions, CacheFetchOptions } from './types';

/**
 * Gestionnaire de cache avancé
 * Fournit des fonctionnalités supplémentaires comme le stale-while-revalidate
 */
class CacheManager {
  private options: CacheOptions;
  private cleanupTimer: number | null = null;
  
  constructor(options?: Partial<CacheOptions>) {
    // Options par défaut
    this.options = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 15 * 60 * 1000, // 15 minutes
      keyPrefix: 'app_cache_',
      debug: false,
      ...options
    };
    
    // Démarrer le nettoyage automatique si activé
    if (this.options.cleanupInterval > 0) {
      this.startCleanupTimer();
    }
  }
  
  /**
   * Démarre le timer de nettoyage automatique
   */
  private startCleanupTimer(): void {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }
  
  /**
   * Arrête le timer de nettoyage automatique
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  public cleanup(): number {
    const count = cacheService.cleanExpired();
    if (this.options.debug && count > 0) {
      console.log(`[CacheManager] Nettoyage automatique: ${count} entrées supprimées`);
    }
    return count;
  }
  
  /**
   * Construit une clé de cache avec le préfixe global
   */
  private getKey(key: string): string {
    return `${this.options.keyPrefix}${key}`;
  }
  
  /**
   * Récupère une valeur du cache ou exécute la fonction fetcher si nécessaire
   */
  public async fetch<T>(
    key: string,
    options: CacheFetchOptions<T>
  ): Promise<T> {
    const cacheKey = this.getKey(key);
    
    // Indiquer le chargement
    if (options.onLoading) {
      options.onLoading(true);
    }
    
    try {
      // Vérifier si les données sont dans le cache
      const cachedData = cacheService.get<T>(cacheKey);
      
      // Si les données sont dans le cache et non expirées (ou staleWhileRevalidate est activé)
      if (cachedData !== null) {
        if (this.options.debug) {
          console.log(`[CacheManager] Cache hit: ${key}`);
        }
        
        // Notifier le succès avec les données du cache
        if (options.onSuccess) {
          options.onSuccess(cachedData, true);
        }
        
        // Si staleWhileRevalidate est activé, rafraîchir les données en arrière-plan
        if (options.staleWhileRevalidate && cacheService.getExpiry(cacheKey) !== null) {
          this.refreshInBackground(cacheKey, options);
        }
        
        return cachedData;
      }
      
      // Si les données ne sont pas dans le cache ou sont expirées
      if (this.options.debug) {
        console.log(`[CacheManager] Cache miss: ${key}`);
      }
      
      // Récupérer les données via la fonction fetcher
      const data = await options.fetcher();
      
      // Stocker les données dans le cache
      const ttl = options.ttl !== undefined ? options.ttl : this.options.defaultTTL;
      cacheService.set(cacheKey, data, ttl);
      
      // Notifier le succès avec les nouvelles données
      if (options.onSuccess) {
        options.onSuccess(data, false);
      }
      
      return data;
    } catch (error) {
      // Gérer l'erreur
      if (this.options.debug) {
        console.error(`[CacheManager] Error fetching ${key}:`, error);
      }
      
      // Notifier l'erreur
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      throw error;
    } finally {
      // Indiquer la fin du chargement
      if (options.onLoading) {
        options.onLoading(false);
      }
    }
  }
  
  /**
   * Rafraîchit les données en arrière-plan
   */
  private async refreshInBackground<T>(
    cacheKey: string,
    options: CacheFetchOptions<T>
  ): Promise<void> {
    if (this.options.debug) {
      console.log(`[CacheManager] Refreshing in background: ${cacheKey}`);
    }
    
    try {
      // Récupérer les données via la fonction fetcher
      const data = await options.fetcher();
      
      // Stocker les données dans le cache
      const ttl = options.ttl !== undefined ? options.ttl : this.options.defaultTTL;
      cacheService.set(cacheKey, data, ttl);
      
      if (this.options.debug) {
        console.log(`[CacheManager] Background refresh completed: ${cacheKey}`);
      }
    } catch (error) {
      if (this.options.debug) {
        console.error(`[CacheManager] Background refresh failed: ${cacheKey}`, error);
      }
      // Ne pas propager l'erreur car c'est un rafraîchissement en arrière-plan
    }
  }
  
  /**
   * Invalide une entrée du cache
   */
  public invalidate(key: string): void {
    cacheService.remove(this.getKey(key));
    if (this.options.debug) {
      console.log(`[CacheManager] Cache invalidated: ${key}`);
    }
  }
  
  /**
   * Invalide toutes les entrées du cache ayant un certain préfixe
   */
  public invalidateByPrefix(prefix: string): number {
    const count = cacheService.removeByPrefix(this.getKey(prefix));
    if (this.options.debug) {
      console.log(`[CacheManager] Cache invalidated by prefix: ${prefix} (${count} entries)`);
    }
    return count;
  }
}

// Exporter une instance par défaut du gestionnaire de cache
export const cacheManager = new CacheManager({
  debug: process.env.NODE_ENV === 'development'
});

// Exporter la classe pour permettre la création d'instances personnalisées
export { CacheManager };
