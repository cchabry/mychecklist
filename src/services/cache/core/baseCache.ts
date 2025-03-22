
/**
 * Service de cache de base
 * Fournit les fonctionnalités essentielles pour stocker et récupérer des données en cache
 */

import { CacheEntry, CacheOptions, DEFAULT_CACHE_OPTIONS } from '../types/cacheEntry';
import { getFullKey, getOriginalKey } from '../utils/keyUtils';
import { logCacheEvent } from '../utils/logger';

/**
 * Classe principale du service de cache
 */
export class Cache {
  private storage: Map<string, CacheEntry<any>>;
  private options: CacheOptions;
  private cleanupTimer: number | null = null;

  /**
   * Crée une nouvelle instance du cache
   */
  constructor(options: Partial<CacheOptions> = {}) {
    this.storage = new Map<string, CacheEntry<any>>();
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    
    // Démarrer le nettoyage automatique si configuré
    if (this.options.cleanupInterval > 0) {
      this.startCleanupTimer();
    }
    
    this.log('Cache initialisé', this.options);
  }

  /**
   * Stocke une valeur dans le cache
   * @param key Clé d'identification
   * @param value Valeur à stocker
   * @param ttl Durée de vie en ms (0 = pas d'expiration)
   * @returns La clé utilisée
   */
  set<T>(key: string, value: T, ttl?: number): string {
    const fullKey = this.getFullKey(key);
    const timestamp = Date.now();
    const expiry = ttl === 0 ? null : 
                  ttl ? timestamp + ttl : 
                  this.options.defaultTTL ? timestamp + this.options.defaultTTL : 
                  null;
    
    this.storage.set(fullKey, {
      data: value,
      expiry,
      timestamp
    });
    
    this.log(`Valeur mise en cache: ${key}`, { ttl, expiry });
    
    return key;
  }

  /**
   * Récupère une valeur du cache
   * @param key Clé d'identification
   * @returns La valeur ou null si absente/expirée
   */
  get<T>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const entry = this.storage.get(fullKey);
    
    // Aucune entrée trouvée
    if (!entry) {
      this.log(`Cache miss: ${key} (non trouvé)`);
      return null;
    }
    
    // Vérifier l'expiration
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.log(`Cache miss: ${key} (expiré)`, { 
        expiry: new Date(entry.expiry).toISOString(),
        now: new Date().toISOString()
      });
      this.storage.delete(fullKey);
      return null;
    }
    
    this.log(`Cache hit: ${key}`);
    return entry.data;
  }

  /**
   * Supprime une entrée du cache
   * @param key Clé à supprimer
   * @returns true si supprimé, false sinon
   */
  delete(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const result = this.storage.delete(fullKey);
    this.log(`Entrée supprimée: ${key}`, { success: result });
    return result;
  }

  /**
   * Alias pour delete() - pour compatibilité
   */
  remove(key: string): boolean {
    return this.delete(key);
  }

  /**
   * Récupère une valeur avec possibilité de recharger si absente/expirée
   * @param key Clé d'identification
   * @param fetcher Fonction pour récupérer les données si absentes
   * @param ttl Durée de vie en ms
   * @returns La valeur du cache ou nouvellement récupérée
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // Tenter de récupérer depuis le cache
    const cachedValue = this.get<T>(key);
    
    // Si trouvé, retourner directement
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Sinon, exécuter le fetcher et mettre en cache
    try {
      const freshValue = await fetcher();
      this.set(key, freshValue, ttl);
      return freshValue;
    } catch (error) {
      this.log(`Erreur lors du chargement des données pour: ${key}`, error);
      throw error;
    }
  }

  /**
   * Vérifie si une clé existe dans le cache et n'est pas expirée
   * @param key Clé à vérifier
   * @returns true si présent et valide
   */
  has(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const entry = this.storage.get(fullKey);
    
    if (!entry) {
      return false;
    }
    
    // Vérifier l'expiration
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.storage.delete(fullKey);
      return false;
    }
    
    return true;
  }

  /**
   * Vide entièrement le cache
   * @returns Le nombre d'entrées supprimées
   */
  clear(): number {
    const count = this.storage.size;
    this.storage.clear();
    this.log(`Cache entièrement vidé (${count} entrées)`);
    return count;
  }

  /**
   * Supprime toutes les entrées expirées du cache
   * @returns Le nombre d'entrées supprimées
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    // Parcourir toutes les entrées
    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        this.storage.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.log(`Nettoyage du cache: ${count} entrées supprimées`);
    }
    
    return count;
  }

  /**
   * Alias pour cleanup() - pour compatibilité
   */
  cleanExpired(): number {
    return this.cleanup();
  }

  /**
   * Récupère toutes les entrées correspondant à un préfixe
   * @param prefix Préfixe à rechercher
   * @returns Liste de paires [clé, valeur]
   */
  getByPrefix<T>(prefix: string): [string, T][] {
    const fullPrefix = this.getFullKey(prefix);
    const result: [string, T][] = [];
    const now = Date.now();
    
    for (const [key, entry] of this.storage.entries()) {
      // Vérifier le préfixe
      if (!key.startsWith(fullPrefix)) {
        continue;
      }
      
      // Vérifier l'expiration
      if (entry.expiry !== null && entry.expiry < now) {
        this.storage.delete(key);
        continue;
      }
      
      // Ajouter au résultat (en supprimant le préfixe global)
      const originalKey = this.getOriginalKey(key);
      result.push([originalKey, entry.data]);
    }
    
    return result;
  }

  /**
   * Supprime toutes les entrées correspondant à un préfixe
   * @param prefix Préfixe à rechercher
   * @returns Le nombre d'entrées supprimées
   */
  deleteByPrefix(prefix: string): number {
    const fullPrefix = this.getFullKey(prefix);
    let count = 0;
    
    for (const key of this.storage.keys()) {
      if (key.startsWith(fullPrefix)) {
        this.storage.delete(key);
        count++;
      }
    }
    
    this.log(`Préfixe supprimé: ${prefix} (${count} entrées)`);
    return count;
  }

  /**
   * Récupère toutes les entrées du cache
   * @returns Liste des entrées avec leurs métadonnées
   */
  getAll(): Array<{key: string, data: any, expiry: number | null, timestamp: number}> {
    const entries: Array<{key: string, data: any, expiry: number | null, timestamp: number}> = [];
    
    for (const [fullKey, entry] of this.storage.entries()) {
      // Vérifier l'expiration
      if (entry.expiry !== null && entry.expiry < Date.now()) {
        this.storage.delete(fullKey);
        continue;
      }
      
      // Ajouter à la liste
      entries.push({
        key: this.getOriginalKey(fullKey),
        data: entry.data,
        expiry: entry.expiry,
        timestamp: entry.timestamp
      });
    }
    
    return entries;
  }

  /**
   * Démarre le timer de nettoyage automatique
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
    
    this.log('Timer de nettoyage démarré', {
      interval: this.options.cleanupInterval
    });
  }

  /**
   * Arrête le timer de nettoyage automatique
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      this.log('Timer de nettoyage arrêté');
    }
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): Record<string, any> {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;
    let noExpiryCount = 0;
    
    for (const entry of this.storage.values()) {
      if (entry.expiry === null) {
        noExpiryCount++;
      } else if (entry.expiry < now) {
        expiredCount++;
      } else {
        validCount++;
      }
    }
    
    return {
      total: this.storage.size,
      valid: validCount,
      expired: expiredCount,
      noExpiry: noExpiryCount,
      options: this.options
    };
  }

  /**
   * Génère une clé complète avec le préfixe
   */
  private getFullKey(key: string): string {
    return getFullKey(this.options.keyPrefix, key);
  }

  /**
   * Récupère la clé originale sans le préfixe
   */
  private getOriginalKey(fullKey: string): string {
    return getOriginalKey(this.options.keyPrefix, fullKey);
  }

  /**
   * Affiche un message de log si le mode debug est activé
   */
  private log(message: string, data?: any): void {
    logCacheEvent(this.options.debug, message, data);
  }
}
