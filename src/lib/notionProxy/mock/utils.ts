
/**
 * Utilitaires pour la compatibilité avec l'ancien système mockMode
 */

import { operationModeUtils } from '@/services/operationMode/utils';

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
