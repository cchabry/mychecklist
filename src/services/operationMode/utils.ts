
import { operationMode } from './operationModeService';

/**
 * Utilitaires pour faciliter l'utilisation du mode opérationnel
 */
export const operationModeUtils = {
  /**
   * Force temporairement le mode réel pour une opération
   * @returns Si l'application était en mode démo avant
   */
  temporarilyForceReal: (): boolean => {
    const wasMock = operationMode.isDemoMode;
    if (wasMock) {
      operationMode.enableRealMode();
    }
    return wasMock;
  },
  
  /**
   * Restaure le mode démo après une opération en mode réel forcé
   */
  restoreAfterForceReal: (wasMock: boolean): void => {
    if (wasMock) {
      operationMode.enableDemoMode('Restauration après force réel');
    }
  },
  
  /**
   * Vérifie si l'application est temporairement en mode réel forcé
   */
  isTemporarilyForcedReal: (wasMock: boolean): boolean => {
    return wasMock && !operationMode.isDemoMode;
  },
  
  /**
   * Applique un délai simulé pour les opérations en mode démo
   */
  applySimulatedDelay: async (delay: number = 500): Promise<void> => {
    if (operationMode.isDemoMode && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en mode démo
   */
  shouldSimulateError: (errorRate: number = 5): boolean => {
    if (operationMode.isDemoMode) {
      return Math.random() * 100 < errorRate;
    }
    return false;
  }
};
