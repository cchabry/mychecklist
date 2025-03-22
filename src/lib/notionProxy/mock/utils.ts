
import { mockState } from './state';

/**
 * Utilitaires pour le fonctionnement du mode mock
 */
export const mockUtils = {
  /**
   * Applique un délai simulé (utile pour tester les états de chargement)
   */
  async applySimulatedDelay(): Promise<void> {
    const config = mockState.getConfig();
    if (mockState.isActive() && config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en fonction du taux d'erreur
   */
  shouldSimulateError(): boolean {
    const config = mockState.getConfig();
    if (!mockState.isActive() || config.errorRate <= 0) {
      return false;
    }
    return Math.random() * 100 < config.errorRate;
  },
  
  /**
   * Crée une erreur simulée
   */
  createSimulatedError(message: string): Error {
    const error = new Error(message);
    error.name = 'MockedError';
    return error;
  }
};
