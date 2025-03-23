
/**
 * Utilitaires pour la compatibilité avec l'ancien système mockMode
 */

import { operationModeUtils } from '@/services/operationMode/utils';
import { operationMode } from '@/services/operationMode';

/**
 * Vérifie si le mode mock est actif
 */
export const isMockActive = (): boolean => {
  return operationMode.isDemoMode;
};

/**
 * Désactive temporairement le mode mock
 */
export const temporarilyDisableMock = (): void => {
  operationMode.enableRealMode();
};

/**
 * Active le mode mock
 */
export const enableMock = (): void => {
  operationMode.enableDemoMode('Activation manuelle via API');
};

/**
 * Adaptateur pour la compatibilité avec l'ancien système mockMode
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
  forceError: operationModeUtils.simulateConnectionError,
  
  /**
   * Récupère un scénario de démo
   */
  getScenario: operationModeUtils.getScenario
};

/**
 * Pour compatibilité avec l'ancien mock.utils
 */
export default mockUtils;
