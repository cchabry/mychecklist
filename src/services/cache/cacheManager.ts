
/**
 * Gestionnaire de cache avancé
 * Construit sur le service de cache de base et offre des fonctionnalités avancées
 */

import { Cache } from './cache';
import { CacheFetchOptions, CacheOptions } from './types';

/**
 * Classe du gestionnaire de cache avancé
 */
export class CacheManager {
  private cache: Cache;
  private pendingFetches: Map<string, Promise<any>>;
  
  constructor(options?: Partial<CacheOptions>) {
    this.cache = new Cache(options);
    this.pendingFetches = new Map();
  }
  
  /**
   * Récupère une valeur du cache ou l'obtient via le fetcher
   * Supporte la stratégie stale-while-revalidate et les callbacks
   */
  async fetch<T>(
    key: string,
    options: CacheFetchOptions<T>
  ): Promise<T> {
    const {
      fetcher,
      ttl,
      skipCache = false,
      staleWhileRevalidate = false,
      onSuccess,
      onError,
      onLoading
    } = options;
    
    // Signaler le début du chargement
    if (onLoading) {
      onLoading(true);
    }
    
    try {
      // Vérifier s'il faut ignorer le cache
      if (skipCache) {
        // Exécuter le fetcher directement
        const freshData = await this.executeFetcher(key, fetcher);
        
        // Mettre en cache le résultat
        this.cache.set(key, freshData, ttl);
        
        // Appeler le callback de succès
        if (onSuccess) {
          onSuccess(freshData, false);
        }
        
        // Signaler la fin du chargement
        if (onLoading) {
          onLoading(false);
        }
        
        return freshData;
      }
      
      // Vérifier si des données en cache sont disponibles
      const cachedData = this.cache.get<T>(key);
      
      // Si des données sont en cache
      if (cachedData !== null) {
        // Si stale-while-revalidate est activé, rafraîchir en arrière-plan
        if (staleWhileRevalidate) {
          // Rafraîchir en arrière-plan
          this.refreshInBackground(key, fetcher, ttl, onSuccess);
        }
        
        // Appeler le callback de succès avec les données du cache
        if (onSuccess) {
          onSuccess(cachedData, true);
        }
        
        // Signaler la fin du chargement
        if (onLoading) {
          onLoading(false);
        }
        
        return cachedData;
      }
      
      // Aucune donnée en cache, exécuter le fetcher
      const freshData = await this.executeFetcher(key, fetcher);
      
      // Mettre en cache le résultat
      this.cache.set(key, freshData, ttl);
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess(freshData, false);
      }
      
      return freshData;
    } catch (error) {
      // Appeler le callback d'erreur
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      throw error;
    } finally {
      // Signaler la fin du chargement dans tous les cas
      if (onLoading) {
        onLoading(false);
      }
    }
  }
  
  /**
   * Exécute un fetcher avec déduplication des requêtes simultanées
   */
  private async executeFetcher<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Vérifier si une requête est déjà en cours pour cette clé
    const pendingFetch = this.pendingFetches.get(key);
    
    if (pendingFetch) {
      // Réutiliser la promesse existante
      return pendingFetch as Promise<T>;
    }
    
    // Créer une nouvelle promesse
    const fetchPromise = fetcher();
    
    // Enregistrer la promesse en cours
    this.pendingFetches.set(key, fetchPromise);
    
    try {
      // Attendre le résultat
      const result = await fetchPromise;
      return result;
    } finally {
      // Supprimer la promesse en cours
      this.pendingFetches.delete(key);
    }
  }
  
  /**
   * Rafraîchit les données en cache en arrière-plan
   */
  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    onSuccess?: (data: T, fromCache: boolean) => void
  ): Promise<void> {
    try {
      // Exécuter le fetcher
      const freshData = await fetcher();
      
      // Mettre à jour le cache
      this.cache.set(key, freshData, ttl);
      
      // Appeler le callback si nécessaire
      if (onSuccess) {
        onSuccess(freshData, false);
      }
    } catch (error) {
      // Ignorer les erreurs en arrière-plan, elles seront gérées
      // lors de la prochaine requête explicite
      console.warn(`[CacheManager] Erreur lors du rafraîchissement en arrière-plan pour ${key}:`, error);
    }
  }
  
  /**
   * Définit une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }
  
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    return this.cache.get<T>(key);
  }
  
  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Supprime une entrée du cache
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Supprime toutes les entrées correspondant à un préfixe
   */
  invalidateByPrefix(prefix: string): number {
    return this.cache.deleteByPrefix(prefix);
  }
  
  /**
   * Vide entièrement le cache
   */
  clear(): number {
    return this.cache.clear();
  }
  
  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): Record<string, any> {
    return this.cache.getStats();
  }
  
  /**
   * Supprime toutes les entrées expirées du cache
   */
  cleanup(): number {
    return this.cache.cleanup();
  }
}

// Exporter une instance par défaut
export const cacheManager = new CacheManager({
  debug: process.env.NODE_ENV === 'development',
  keyPrefix: 'app-cache:v1:'
});

