
import { operationMode } from './operationModeService';

/**
 * Utilitaires pour le système operationMode
 */
export const operationModeUtils = {
  /**
   * Applique un délai simulé basé sur la configuration
   */
  async applySimulatedDelay(): Promise<void> {
    const { simulatedNetworkDelay } = operationMode.getSettings();
    if (simulatedNetworkDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, simulatedNetworkDelay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en fonction du taux configuré
   */
  shouldSimulateError(): boolean {
    const { errorSimulationRate } = operationMode.getSettings();
    return Math.random() * 100 < errorSimulationRate;
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    throw new Error('Erreur simulée par le système operationMode');
  },
  
  /**
   * Récupère un scénario spécifique pour le mode démo
   */
  getScenario(context: string): string | null {
    // Pour l'instant, on ne gère pas de scénarios spécifiques
    return null;
  },

  /**
   * Détermine si une erreur est probablement temporaire (réseau, CORS, autorisation, etc.)
   */
  isTemporaryError(error: Error): boolean {
    const errorMessage = error.message || '';
    const temporaryPatterns = [
      /Failed to fetch/i,
      /Network error/i,
      /timeout/i,
      /Timed out/i,
      /CORS/i,
      /headers/i,
      /403/i,  // Erreurs d'autorisation souvent temporaires
      /401/i,  // Erreurs d'authentification souvent temporaires
      /throttled/i,
      /limit/i,
      /quota/i,
      /too many requests/i,
      /rate limit/i
    ];
    
    return temporaryPatterns.some(pattern => pattern.test(errorMessage));
  },

  /**
   * Crée un wrapper pour les opérations critiques qui ne doivent pas
   * basculer en mode démo même en cas d'erreur
   */
  createCriticalOperationWrapper<T, Args extends any[]>(
    operationName: string,
    fn: (...args: Args) => Promise<T>
  ): (...args: Args) => Promise<T> {
    return async (...args: Args) => {
      try {
        // Marquer cette opération comme critique
        operationMode.markOperationAsCritical(operationName);
        
        // Exécuter l'opération
        const result = await fn(...args);
        
        // Signaler le succès
        operationMode.handleSuccessfulOperation();
        
        return result;
      } catch (error) {
        // Gérer l'erreur sans basculer en mode démo
        console.error(`[CriticalOperation] Erreur dans ${operationName}:`, error);
        
        // Signaler l'erreur mais elle sera traitée comme une erreur temporaire
        operationMode.handleConnectionError(
          error instanceof Error ? error : new Error(String(error)),
          operationName,
          true // Indiquer explicitement que c'est une erreur non critique
        );
        
        throw error;
      } finally {
        // Démarquer l'opération comme critique
        operationMode.unmarkOperationAsCritical(operationName);
      }
    };
  }
};
