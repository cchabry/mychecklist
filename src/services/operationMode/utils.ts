
/**
 * Utilitaires pour le système operationMode
 * Adapter pour assurer la compatibilité avec le code existant
 */

export const operationModeUtils = {
  /**
   * Détecte si une erreur est temporaire (réseau, timeout, etc)
   */
  isTemporaryError(error: Error): boolean {
    const errorPatterns = [
      /Failed to fetch/i,
      /Network error/i,
      /timeout/i,
      /Timed out/i,
      /CORS/i,
      /headers/i
    ];
    
    return errorPatterns.some(pattern => pattern.test(error.message));
  },
  
  /**
   * Applique un délai simulé pour les requêtes en mode démo
   */
  async applySimulatedDelay(min: number = 300, max: number = 800): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  },
  
  /**
   * Détermine si une erreur doit être simulée (basé sur le taux configuré)
   */
  shouldSimulateError(rate: number = 10): boolean {
    return Math.random() * 100 < rate;
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    throw new Error("Erreur simulée - Mode démo");
  },
  
  /**
   * Récupère un scénario de démo pour un contexte donné
   */
  getScenario(context: string): any {
    // Par défaut, retourner un objet vide
    return {};
  }
};
