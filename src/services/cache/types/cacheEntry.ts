
/**
 * Types for core cache functionality
 */

/**
 * Structure d'une entrée dans le cache
 */
export interface CacheEntry<T> {
  data: T;
  expiry: number | null;
  timestamp: number;
}

/**
 * Options pour la configuration du cache
 */
export interface CacheOptions {
  /**
   * Durée de vie par défaut en millisecondes
   * 0 = pas d'expiration
   */
  defaultTTL: number;
  
  /**
   * Intervalle de nettoyage automatique en millisecondes
   * 0 = pas de nettoyage automatique
   */
  cleanupInterval: number;
  
  /**
   * Préfixe global ajouté à toutes les clés
   */
  keyPrefix: string;
  
  /**
   * Si true, les erreurs de cache seront affichées dans la console
   */
  debug: boolean;
}

// Configuration par défaut du cache
export const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes par défaut
  cleanupInterval: 10 * 60 * 1000, // Nettoyage toutes les 10 minutes
  keyPrefix: 'app-cache:',
  debug: false
};
