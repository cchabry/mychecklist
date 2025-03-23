
/**
 * Utilitaires pour le mode opérationnel
 */

import { operationMode } from './index';

export const operationModeUtils = {
  /**
   * Applique un délai simulé selon la configuration du mode
   */
  async applySimulatedDelay(): Promise<void> {
    if (!operationMode.isDemoMode) {
      return Promise.resolve();
    }
    
    const settings = operationMode.getSettings();
    const delay = settings.simulatedNetworkDelay || 0;
    
    if (delay > 0) {
      return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return Promise.resolve();
  },
  
  /**
   * Détermine si une erreur doit être simulée selon le taux configuré
   */
  shouldSimulateError(): boolean {
    if (!operationMode.isDemoMode) {
      return false;
    }
    
    const settings = operationMode.getSettings();
    const errorRate = settings.errorSimulationRate || 0;
    
    return Math.random() * 100 < errorRate;
  },
  
  /**
   * Génère une erreur simulée
   */
  generateSimulatedError(action: string): Error {
    return new Error(`Erreur simulée lors de l'action: ${action}`);
  },
  
  /**
   * Simule une erreur de connexion
   */
  simulateConnectionError(): never {
    throw new Error("Erreur de connexion simulée");
  },
  
  /**
   * Récupère un scénario de démo en fonction du contexte
   * @param context Contexte du scénario
   * @returns Données du scénario ou null si aucun scénario n'est configuré
   */
  getScenario(context: string): any | null {
    // Pour l'instant, retourne null (pas de scénario configuré)
    // Cette méthode pourra être enrichie pour retourner des scénarios prédéfinis
    return null;
  },
  
  /**
   * Simule une opération avec possibilité d'erreur et délai
   */
  async simulateOperation<T>(operation: () => T | Promise<T>, action: string): Promise<T> {
    // Simuler un délai réseau
    await this.applySimulatedDelay();
    
    // Simuler une erreur potentielle
    if (this.shouldSimulateError()) {
      throw this.generateSimulatedError(action);
    }
    
    // Exécuter l'opération réelle
    return operation();
  }
};
