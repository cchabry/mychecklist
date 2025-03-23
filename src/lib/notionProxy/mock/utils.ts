
/**
 * Utilitaires pour les fonctionnalités de simulation
 * Note: Ce module sera à terme remplacé par operationModeUtils
 */

import { operationMode, operationModeUtils } from '@/services/operationMode';

/**
 * Vérifie si le mode démonstration est actif
 */
export const isMockActive = (): boolean => {
  return operationMode.isDemoMode;
};

/**
 * Active le mode réel
 */
export const temporarilyDisableMock = (): void => {
  operationMode.enableRealMode();
};

/**
 * Active le mode démonstration
 */
export const enableMock = (): void => {
  operationMode.enableDemoMode('Activation manuelle via API');
};

/**
 * Utilitaires pour la simulation en mode démonstration
 * @deprecated Utilisez directement operationModeUtils
 */
export const mockUtils = {
  /**
   * Applique un délai simulé
   */
  applyDelay: operationModeUtils.applySimulatedDelay,
  
  /**
   * Simule une erreur de connexion (aléatoire selon le taux d'erreur configuré)
   */
  maybeSimulateError: () => {
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
  },
  
  /**
   * Force une erreur simulée
   */
  forceError: () => operationModeUtils.simulateConnectionError(),
  
  /**
   * Récupère un scénario de démo
   */
  getScenario: (context: string) => operationModeUtils.getScenario(context)
};

export default mockUtils;
