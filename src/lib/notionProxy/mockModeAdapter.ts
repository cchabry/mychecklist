
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';

/**
 * Adaptateur pour rediriger les appels mockMode vers operationMode
 * Permet une transition en douceur vers le nouveau système
 * @deprecated À utiliser uniquement pendant la phase de transition
 */
export const mockModeAdapter = {
  /**
   * Vérifie si le mode mock est actif (redirection vers operationMode.isDemoMode)
   * @deprecated Utiliser operationMode.isDemoMode à la place
   */
  isActive(): boolean {
    console.warn('mockMode.isActive() est déprécié. Utiliser operationMode.isDemoMode à la place');
    return operationMode.isDemoMode;
  },
  
  /**
   * Active le mode mock (redirection vers operationMode.enableDemoMode)
   * @deprecated Utiliser operationMode.enableDemoMode à la place
   */
  activate(): void {
    console.warn('mockMode.activate() est déprécié. Utiliser operationMode.enableDemoMode à la place');
    operationMode.enableDemoMode('Appel à mockMode.activate() déprécié');
  },
  
  /**
   * Désactive le mode mock (redirection vers operationMode.enableRealMode)
   * @deprecated Utiliser operationMode.enableRealMode à la place
   */
  deactivate(): void {
    console.warn('mockMode.deactivate() est déprécié. Utiliser operationMode.enableRealMode à la place');
    operationMode.enableRealMode();
  },
  
  /**
   * Bascule l'état du mode mock (redirection vers operationMode.toggle)
   * @deprecated Utiliser operationMode.toggle à la place
   */
  toggle(): boolean {
    console.warn('mockMode.toggle() est déprécié. Utiliser operationMode.toggle à la place');
    operationMode.toggle();
    return operationMode.isDemoMode;
  },
  
  /**
   * Force reset du mode mock
   * @deprecated Cette opération n'a plus d'équivalent direct
   */
  forceReset(): void {
    console.warn('mockMode.forceReset() est déprécié. Utiliser operationMode.reset à la place');
    operationMode.reset();
  },
  
  /**
   * Désactive temporairement le mode mock pour une opération
   * @deprecated Utiliser operationModeUtils.temporarilyForceReal à la place
   */
  temporarilyForceReal(): boolean {
    console.warn('mockMode.temporarilyForceReal() est déprécié. Utiliser operationModeUtils.temporarilyForceReal à la place');
    return operationModeUtils.temporarilyForceReal();
  },
  
  /**
   * Restaure le mode mock après une opération en mode réel forcé
   * @deprecated Utiliser operationModeUtils.restoreAfterForceReal à la place
   */
  restoreAfterForceReal(wasMock: boolean): void {
    console.warn('mockMode.restoreAfterForceReal() est déprécié. Utiliser operationModeUtils.restoreAfterForceReal à la place');
    operationModeUtils.restoreAfterForceReal(wasMock);
  },
  
  /**
   * Récupère le délai de simulation
   */
  getDelay: (): number => 500,
  
  /**
   * Définit le délai de simulation
   * @deprecated Fonctionnalité non supportée dans le nouveau système
   */
  setDelay: (delay: number): void => {
    console.warn('mockMode.setDelay() est déprécié et n\'a pas d\'équivalent direct');
  },
  
  /**
   * Récupère le scénario actif
   */
  getScenario: (): string => 'standard',
  
  /**
   * Définit le scénario actif
   * @deprecated Fonctionnalité non supportée dans le nouveau système
   */
  setScenario: (scenario: string): void => {
    console.warn('mockMode.setScenario() est déprécié et n\'a pas d\'équivalent direct');
  },
  
  /**
   * Récupère le taux d'erreur
   */
  getErrorRate: (): number => 0,
  
  /**
   * Définit le taux d'erreur
   * @deprecated Fonctionnalité non supportée dans le nouveau système
   */
  setErrorRate: (errorRate: number): void => {
    console.warn('mockMode.setErrorRate() est déprécié et n\'a pas d\'équivalent direct');
  },
  
  /**
   * Applique un délai simulé (redirection vers operationModeUtils.applySimulatedDelay)
   * @deprecated Utiliser operationModeUtils.applySimulatedDelay à la place
   */
  applySimulatedDelay: async (delay: number = 500): Promise<void> => {
    console.warn('mockMode.applySimulatedDelay() est déprécié. Utiliser operationModeUtils.applySimulatedDelay à la place');
    await operationModeUtils.applySimulatedDelay(delay);
  },
  
  /**
   * Détermine si une erreur doit être simulée (redirection vers operationModeUtils.shouldSimulateError)
   * @deprecated Utiliser operationModeUtils.shouldSimulateError à la place
   */
  shouldSimulateError: (errorRate: number = 5): boolean => {
    console.warn('mockMode.shouldSimulateError() est déprécié. Utiliser operationModeUtils.shouldSimulateError à la place');
    return operationModeUtils.shouldSimulateError(errorRate);
  }
};
