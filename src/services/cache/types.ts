
/**
 * Types pour le système de cache
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

/**
 * Options pour la récupération du cache
 */
export interface CacheFetchOptions<T> {
  /**
   * Fonction à exécuter si le cache est absent ou expiré
   */
  fetcher: () => Promise<T>;
  
  /**
   * Temps de vie spécifique pour cette entrée
   */
  ttl?: number;
  
  /**
   * Si true, le cache sera ignoré et une nouvelle requête sera effectuée
   */
  skipCache?: boolean;
  
  /**
   * Si true, le cache sera utilisé même s'il est expiré, mais sera rafraîchi en arrière-plan
   */
  staleWhileRevalidate?: boolean;
  
  /**
   * Callbacks d'événements
   */
  onSuccess?: (data: T, fromCache: boolean) => void;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
}
