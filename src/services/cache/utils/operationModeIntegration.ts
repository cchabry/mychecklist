
import { operationMode } from '@/services/operationMode';

/**
 * Utilitaires pour l'intégration du cache avec le système operationMode
 */
export const operationModeIntegration = {
  /**
   * Détermine si le cache doit être utilisé dans le contexte actuel
   */
  shouldUseCache(): boolean {
    // En mode démo, toujours utiliser le cache
    if (operationMode.isDemoMode) {
      return true;
    }
    
    // En mode réel, utiliser le cache selon le paramètre (par défaut: true)
    return true; // Simplifié pour toujours utiliser le cache
  },
  
  /**
   * Détermine si les opérations doivent être complètement simulées
   */
  shouldSimulateOperations(): boolean {
    return operationMode.isDemoMode;
  },
  
  /**
   * Détermine le TTL (time-to-live) du cache
   */
  getCacheTTL(defaultTTL: number): number {
    // En mode démo, on peut avoir un TTL plus long
    if (operationMode.isDemoMode) {
      return defaultTTL * 2;
    }
    
    return defaultTTL;
  },
  
  /**
   * Applique un délai simulé si nécessaire
   */
  async applySimulatedDelay(): Promise<void> {
    if (operationMode.isDemoMode) {
      // Délai fixe simplifié
      const delay = 300;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée
   */
  shouldSimulateError(): boolean {
    if (!operationMode.isDemoMode) {
      return false;
    }
    
    // Taux d'erreur fixe très bas (0.5%)
    return Math.random() < 0.005;
  },
  
  /**
   * Désactive le cache pour l'application
   */
  disableCache(): void {
    localStorage.setItem('cache_disabled', 'true');
  },
  
  /**
   * Active le cache pour l'application
   */
  enableCache(): void {
    localStorage.removeItem('cache_disabled');
  },
  
  /**
   * Vérifie si le cache est désactivé globalement
   */
  isCacheDisabled(): boolean {
    return localStorage.getItem('cache_disabled') === 'true';
  },
  
  /**
   * Détermine si le cache doit être utilisé (fonction interne)
   */
  _internalShouldUseCache: function() {
    return !this.isCacheDisabled();
  },
  
  /**
   * Obtenir un TTL effectif
   */
  getEffectiveTTL: function(defaultTTL?: number) {
    return this.getCacheTTL(defaultTTL || 60000);
  },
  
  /**
   * Signaler une erreur de cache
   */
  reportCacheError: function(error: Error, context: string) {
    console.error(`[Cache Error] ${context}:`, error);
    // Signaler l'erreur au système operationMode
    operationMode.handleConnectionError(error, `Cache: ${context}`);
  },
  
  /**
   * Signaler une opération de cache réussie
   */
  reportCacheSuccess: function() {
    operationMode.handleSuccessfulOperation();
  }
};

// Exporter les fonctions individuellement pour l'usage dans d'autres modules
export const { 
  shouldUseCache, 
  getEffectiveTTL, 
  reportCacheError, 
  reportCacheSuccess 
} = operationModeIntegration;
