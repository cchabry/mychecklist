
import { operationMode } from '@/services/operationMode';

/**
 * Utilitaires pour le fonctionnement du mock Notion
 * Utilise le système operationMode tout en conservant une API compatible
 */
export const mockUtils = {
  /**
   * Vérifie si le mode mock est actif (redirection vers operationMode)
   */
  isMockActive: (): boolean => {
    return operationMode.isDemoMode;
  },
  
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
  },
  
  /**
   * Désactive temporairement le mode mock
   * @deprecated Utiliser temporarilyForceReal à la place
   */
  temporarilyDisableMock: (): void => {
    console.warn('temporarilyDisableMock est déprécié. Utiliser temporarilyForceReal à la place');
    mockUtils.temporarilyForceReal();
  }
};

/**
 * Versions pour la compatibilité avec l'ancien code
 * @deprecated Utiliser mockUtils à la place
 */
export const isMockActive = mockUtils.isMockActive;
export const temporarilyDisableMock = mockUtils.temporarilyDisableMock;
