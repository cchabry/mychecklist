
import { operationMode } from './operationModeService';

/**
 * Utilitaires complémentaires pour le service operationMode
 */
export const operationModeUtils = {
  /**
   * Applique un délai simulé (pour mieux simuler le comportement réseau)
   * @param delay Délai en millisecondes (par défaut: utilise la config)
   */
  applySimulatedDelay: async (delay?: number): Promise<void> => {
    const actualDelay = delay ?? operationMode.getSettings().simulatedNetworkDelay;
    if (actualDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée (pour tester la robustesse)
   * @param rate Taux d'erreur en pourcentage (par défaut: utilise la config)
   */
  shouldSimulateError: (rate?: number): boolean => {
    const errorRate = rate ?? operationMode.getSettings().errorSimulationRate;
    return Math.random() * 100 < errorRate;
  },
  
  /**
   * Force temporairement le mode réel et retourne l'état précédent
   * @returns L'état précédent pour être utilisé avec restoreAfterForceReal
   */
  temporarilyForceReal: (): boolean => {
    const wasDemoMode = operationMode.isDemoMode;
    if (wasDemoMode) {
      operationMode.enableRealMode();
    }
    return wasDemoMode;
  },
  
  /**
   * Vérifie si le mode a été temporairement forcé en réel
   * @param previousState État retourné par temporarilyForceReal
   */
  isTemporarilyForcedReal: (previousState: boolean): boolean => {
    return previousState && operationMode.isRealMode;
  },
  
  /**
   * Restaure l'état précédent après un forçage temporaire
   * @param wasDemoMode État précédent retourné par temporarilyForceReal
   */
  restoreAfterForceReal: (wasDemoMode: boolean): void => {
    if (wasDemoMode) {
      operationMode.enableDemoMode('Restauration après forçage temporaire');
    }
  },
  
  /**
   * Génère une erreur simulée pour tester la gestion d'erreur
   * @param message Message d'erreur personnalisé
   */
  createSimulatedError: (message: string = "Erreur simulée"): Error => {
    return new Error(`[Simulé] ${message}`);
  },
  
  /**
   * Simule une opération réseau avec possibilité d'échec aléatoire
   * @param successData Données à retourner en cas de succès
   * @param errorMessage Message d'erreur en cas d'échec
   * @param errorRate Taux d'erreur en pourcentage
   */
  simulateNetworkOperation: async <T>(
    successData: T,
    errorMessage: string = "Erreur réseau simulée",
    errorRate: number = operationMode.getSettings().errorSimulationRate
  ): Promise<T> => {
    // Simuler un délai réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur selon le taux configuré
    if (operationModeUtils.shouldSimulateError(errorRate)) {
      throw new Error(`[Simulé] ${errorMessage}`);
    }
    
    // Retourner les données de succès
    return successData;
  }
};
