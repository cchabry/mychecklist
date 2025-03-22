
/**
 * Utilitaire de journalisation pour le cache
 */

/**
 * Affiche un message de log si le mode debug est activé
 */
export function logCacheEvent(debug: boolean, message: string, data?: any): void {
  if (!debug) {
    return;
  }
  
  console.log(`🗃️ [Cache] ${message}`, data || '');
}
