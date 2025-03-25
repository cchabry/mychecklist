import { DEFAULT_SETTINGS } from './constants';

/**
 * Utilitaires pour le système de mode opérationnel
 */
export const operationModeUtils = {
  /**
   * Détermine si une erreur est temporaire
   */
  isTemporaryError(error: Error): boolean {
    const temporaryPatterns = [
      /Failed to fetch/i,
      /Network error/i,
      /timeout/i,
      /Timed out/i,
      /CORS/i,
      /headers/i
    ];
    
    return temporaryPatterns.some(pattern => pattern.test(error.message));
  },
  
  /**
   * Applique un délai simulé pour les opérations en mode démo
   */
  async applySimulatedDelay(delay?: number): Promise<void> {
    const actualDelay = delay ?? DEFAULT_SETTINGS.simulatedNetworkDelay;
    
    if (actualDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en mode démo
   */
  shouldSimulateError(rate?: number): boolean {
    const errorRate = rate ?? DEFAULT_SETTINGS.errorSimulationRate;
    return Math.random() * 100 < errorRate;
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    throw new Error('Erreur de connexion simulée en mode démo');
  },
  
  /**
   * Récupère un scénario de démo pour un contexte donné
   */
  getScenario(context: string): any {
    // Placeholder, à implémenter selon les besoins
    return {};
  }
};
