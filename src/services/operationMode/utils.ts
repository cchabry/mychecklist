
/**
 * Utilitaires pour le mode opérationnel
 */

import { operationMode } from './operationModeService';

/**
 * Delay minimum pour les opérations simulées (ms)
 */
const MIN_DELAY = 200;

/**
 * Delay maximum pour les opérations simulées (ms)
 */
const MAX_DELAY = 800;

export const operationModeUtils = {
  /**
   * Applique un délai simulé pour les opérations en mode démo
   * @param customDelay Délai personnalisé (optionnel)
   * @returns Promesse résolue après le délai
   */
  applySimulatedDelay: async (customDelay?: number): Promise<void> => {
    if (operationMode.isDemoMode) {
      const settings = operationMode.getSettings();
      const delay = customDelay || settings.simulatedNetworkDelay || 300;
      
      // Ajouter une variation aléatoire de ±20% pour plus de réalisme
      const variation = delay * 0.2;
      const finalDelay = delay + (Math.random() * variation * 2 - variation);
      
      // Limiter le délai entre MIN_DELAY et MAX_DELAY
      const cappedDelay = Math.max(MIN_DELAY, Math.min(MAX_DELAY, finalDelay));
      
      await new Promise(resolve => setTimeout(resolve, cappedDelay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en fonction du taux d'erreur
   * @returns true si une erreur doit être simulée
   */
  shouldSimulateError: (): boolean => {
    if (operationMode.isDemoMode) {
      const settings = operationMode.getSettings();
      const errorRate = settings.errorSimulationRate || 0;
      
      if (errorRate > 0) {
        // Générer un nombre aléatoire entre 0 et 100
        const random = Math.random() * 100;
        return random < errorRate;
      }
    }
    
    return false;
  },
  
  /**
   * Simule une erreur de connexion pour tester le système de gestion des erreurs
   */
  simulateConnectionError: (): never => {
    throw new Error('Erreur de connexion simulée pour tester le système');
  },
  
  /**
   * Récupère le scénario de démo spécifié
   * @param name Nom du scénario
   * @returns Valeur du scénario ou null si non trouvé
   */
  getScenario: (name: string): any => {
    // Cette fonction sera implémentée plus tard pour les scénarios de démo
    return null;
  }
};
