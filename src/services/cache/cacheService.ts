
/**
 * Service de cache pour l'application
 * Gère le stockage et la récupération des données mises en cache
 */

/**
 * Types pour le service de cache
 */
export interface CacheItem<T> {
  value: T;
  expiry: number | null;
}

export interface CacheOptions {
  ttl?: number; // Durée de vie en millisecondes
}

/**
 * Service de cache pour l'application
 */
class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  
  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, options?: CacheOptions | number): void {
    let ttl: number | undefined;
    
    if (typeof options === 'number') {
      ttl = options;
    } else if (options?.ttl) {
      ttl = options.ttl;
    }
    
    const expiry = ttl ? Date.now() + ttl : null;
    
    this.cache.set(key, {
      value,
      expiry
    });
  }
  
  /**
   * Récupère une valeur du cache
   * Retourne undefined si la clé n'existe pas ou si elle est expirée
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // Vérifier si l'entrée est expirée
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }
  
  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Vérifie si une clé existe dans le cache et n'est pas expirée
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Vérifier si l'entrée est expirée
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup(): void {
    const now = Date.now();
    
    this.cache.forEach((item, key) => {
      if (item.expiry && now > item.expiry) {
        this.delete(key);
      }
    });
  }
  
  /**
   * Récupère ou définit une valeur dans le cache
   * Si la clé n'existe pas ou est expirée, appelle la fonction callback pour obtenir la valeur
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Valeur non trouvée dans le cache, appeler la fonction callback
    const value = await callback();
    
    // Stocker la valeur dans le cache
    this.set(key, value, options);
    
    return value;
  }
}

// Exporter une instance singleton
export const cacheService = new CacheService();

// Export par défaut
export default cacheService;
