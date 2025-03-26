
/**
 * Service de cache pour l'application
 * Permet de stocker des données en mémoire avec un TTL (Time To Live)
 */

/**
 * Options pour le cache
 */
export interface CacheOptions {
  ttl?: number; // Time-to-live en millisecondes
}

/**
 * Structure d'une entrée de cache
 */
interface CacheEntry<T> {
  value: T;
  expires: number | null;
}

/**
 * Service de cache
 */
class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes par défaut
  
  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, options?: CacheOptions | number): void {
    const ttl = typeof options === 'number' ? options : options?.ttl || this.TTL;
    const expires = ttl > 0 ? Date.now() + ttl : null;
    
    this.cache.set(key, { value, expires });
  }
  
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Vérifier si l'entrée a expiré
    if (entry.expires !== null && entry.expires < Date.now()) {
      this.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Vérifier si l'entrée a expiré
    if (entry.expires !== null && entry.expires < Date.now()) {
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
   * Récupère une valeur du cache ou exécute la fonction callback si elle n'existe pas
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    const value = await callback();
    this.set(key, value, options);
    
    return value;
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires !== null && entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Exporter une instance singleton
export const cacheService = new CacheService();

// Export par défaut
export default cacheService;
