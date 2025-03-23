
import { operationMode } from './operationModeService';
import { OperationMode } from './types';

/**
 * Utilitaires pour le système operationMode
 */
export const operationModeUtils = {
  /**
   * Applique un délai simulé pour représenter la latence réseau
   * @param minDelay Délai minimum en ms (par défaut: 200)
   * @param maxDelay Délai maximum en ms (par défaut: 800)
   * @returns Promesse résolue après le délai
   */
  applySimulatedDelay: async (minDelay = 200, maxDelay = 800): Promise<void> => {
    // Calculer un délai aléatoire entre min et max
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    // Renvoyer une promesse résolue après le délai
    return new Promise(resolve => setTimeout(resolve, delay));
  },
  
  /**
   * Détermine si une erreur doit être simulée (selon le taux d'erreur)
   * @param errorRate Taux d'erreur entre 0 et 1 (par défaut: 0.05, soit 5%)
   * @returns Vrai si une erreur doit être simulée
   */
  shouldSimulateError: (errorRate = 0.05): boolean => {
    return Math.random() < errorRate;
  },
  
  /**
   * Simule une erreur de connexion
   * @param message Message d'erreur optionnel
   * @throws Error
   */
  simulateConnectionError: (message = "Erreur de connexion simulée"): never => {
    throw new Error(message);
  },
  
  /**
   * Récupère un scénario de démo spécifique
   * @param scenarioName Nom du scénario (par défaut: 'default')
   * @returns Objet contenant les données du scénario
   */
  getScenario: (scenarioName = 'default'): any => {
    // Scénarios prédéfinis (à adapter selon les besoins)
    const scenarios: Record<string, any> = {
      default: {
        name: 'Scénario par défaut',
        config: { errorRate: 0.05, delay: 500 }
      },
      success: {
        name: 'Succès systématique',
        config: { errorRate: 0, delay: 300 }
      },
      error: {
        name: 'Erreurs fréquentes',
        config: { errorRate: 0.8, delay: 200 }
      },
      slow: {
        name: 'Connexion lente',
        config: { errorRate: 0.05, delay: 2000 }
      }
    };
    
    // Retourner le scénario demandé ou le scénario par défaut
    return scenarios[scenarioName] || scenarios.default;
  },
  
  /**
   * Vérifie si l'application est actuellement en mode démo
   */
  isDemoModeActive: (): boolean => {
    return operationMode.isDemoMode;
  },
  
  /**
   * Convertit l'ancien format de mode (isDemoMode: boolean) vers le nouveau (OperationMode)
   */
  convertLegacyMode: (isDemoMode: boolean): OperationMode => {
    return isDemoMode ? OperationMode.DEMO : OperationMode.REAL;
  }
};
