
/**
 * Utilitaires de journalisation pour le système de cache
 */

/**
 * Journalise un événement lié au cache si le mode debug est activé
 */
export function logCacheEvent(debug: boolean, message: string, data?: any): void {
  if (!debug) return;
  
  if (data) {
    console.log(`🗃️ [Cache] ${message}`, data);
  } else {
    console.log(`🗃️ [Cache] ${message}`);
  }
}

/**
 * Type d'événements de cache pour les statistiques
 */
export enum CacheEventType {
  HIT = 'hit',
  MISS = 'miss',
  SET = 'set',
  DELETE = 'delete',
  CLEAN = 'clean',
  ERROR = 'error'
}

/**
 * Enregistre un événement de cache pour les statistiques
 */
export function recordCacheEvent(
  eventType: CacheEventType, 
  key: string, 
  duration?: number,
  metadata?: Record<string, any>
): void {
  // Cette fonction pourrait être étendue pour collecter
  // des métriques sur l'utilisation du cache
  
  // Pour l'instant, nous nous contentons de journaliser en mode développement
  if (process.env.NODE_ENV !== 'development') return;
  
  const event = {
    type: eventType,
    key,
    timestamp: Date.now(),
    duration,
    ...metadata
  };
  
  // Enregistrer l'événement pour des statistiques potentielles
  // À implémenter si nécessaire
}
