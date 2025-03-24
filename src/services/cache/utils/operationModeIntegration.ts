
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
  }
};
