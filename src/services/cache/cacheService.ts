
/**
 * Service de cache pour stocker temporairement des données
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Stocke une valeur dans le cache avec une durée de vie
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Si l'item n'existe pas dans le cache
    if (!item) {
      return null;
    }
    
    // Si l'item a expiré
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  /**
   * Supprime une valeur du cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Vérifie si une valeur existe dans le cache et n'a pas expiré
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Si l'item a expiré
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Exporter une instance singleton
export const cacheService = new CacheService();
