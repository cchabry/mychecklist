
/**
 * Service de cache pour l'application
 */

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheEntry<T> {
  value: T;
  expires: number;
}

/**
 * Service de gestion du cache de l'application
 */
class CacheService {
  private storage: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.storage.get(key);
    if (!entry) return undefined;

    // Vérifier si l'entrée est expirée
    if (entry.expires < Date.now()) {
      this.storage.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Enregistre une valeur dans le cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;
    const expires = Date.now() + ttl;

    this.storage.set(key, {
      value,
      expires
    });
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Récupère une valeur du cache ou définit celle-ci si elle n'existe pas
   */
  getOrSet<T>(key: string, getValue: () => T | Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return Promise.resolve(cached);

    return Promise.resolve(getValue())
      .then(value => {
        this.set(key, value, options);
        return value;
      });
  }
}

// Exporter une instance singleton
export const cacheService = new CacheService();
