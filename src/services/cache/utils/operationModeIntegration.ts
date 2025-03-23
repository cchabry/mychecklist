
/**
 * Utilitaires pour l'intégration avec operationMode
 */

import { operationMode } from '@/services/operationMode';

/**
 * Détermine si le cache doit être utilisé en fonction du mode opérationnel
 */
export function shouldUseCache(): boolean {
  // En mode démo, utilisez toujours le cache pour éviter de simuler
  // trop de requêtes inutiles
  if (operationMode.isDemoMode) {
    return true;
  }
  
  // En mode réel, suivre la configuration
  // Vérifier d'abord si la propriété existe, sinon utiliser true par défaut
  const settings = operationMode.getSettings();
  return settings.useCacheInRealMode !== undefined ? settings.useCacheInRealMode : true;
}

/**
 * Détermine le TTL (Time To Live) à utiliser en fonction du mode opérationnel
 */
export function getEffectiveTTL(requestedTTL?: number): number | null {
  if (requestedTTL === 0) {
    return null; // Pas d'expiration
  }
  
  // En mode démo, on peut utiliser un TTL plus long
  if (operationMode.isDemoMode) {
    return requestedTTL || 15 * 60 * 1000; // 15 minutes par défaut en mode démo
  }
  
  // En mode réel, utiliser le TTL demandé ou une valeur par défaut plus courte
  return requestedTTL || 5 * 60 * 1000; // 5 minutes par défaut en mode réel
}

/**
 * Rapporte une erreur de cache au système operationMode
 */
export function reportCacheError(error: Error, context: string = 'Opération de cache'): void {
  operationMode.handleConnectionError(error, context);
}

/**
 * Rapporte une opération de cache réussie
 */
export function reportCacheSuccess(): void {
  // Optionnellement signaler au système operationMode
  // une opération réussie liée au cache
}
