
import { mockMode as originalMockMode } from './mock';
import { operationMode } from '@/services/operationMode';

/**
 * Version de compatibilité pour assurer la transition vers le nouveau système
 * @deprecated Utilisez operationMode à la place
 */
const compatibilityMockMode = {
  ...originalMockMode,
  
  /**
   * @deprecated Utilisez operationMode.isDemoMode à la place
   */
  get isActive() {
    console.warn('mockMode.isActive (getter) est déprécié. Utilisez operationMode.isDemoMode à la place');
    return operationMode.isDemoMode;
  },
  
  // Make sure this is a function that can be called with parentheses  
  isActive() {
    console.warn('mockMode.isActive() est déprécié. Utilisez operationMode.isDemoMode à la place');
    return operationMode.isDemoMode;
  },
  
  /**
   * @deprecated Utilisez operationMode.enableDemoMode() à la place
   */
  activate(): void {
    console.warn('mockMode.activate est déprécié. Utilisez operationMode.enableDemoMode() à la place');
    operationMode.enableDemoMode('Appel à la méthode mockMode.activate() dépréciée');
  },
  
  /**
   * @deprecated Utilisez operationMode.enableRealMode() à la place
   */
  deactivate(): void {
    console.warn('mockMode.deactivate est déprécié. Utilisez operationMode.enableRealMode() à la place');
    operationMode.enableRealMode();
  },
  
  /**
   * @deprecated Utilisez operationMode.toggle() à la place
   */
  toggle(): boolean {
    console.warn('mockMode.toggle est déprécié. Utilisez operationMode.toggle() à la place');
    operationMode.toggle();
    return operationMode.isDemoMode;
  },
  
  /**
   * Force reset the mock mode
   */
  forceReset(): void {
    console.warn('mockMode.forceReset est déprécié');
    operationMode.enableRealMode();
  },
  
  /**
   * @deprecated Utilisez mockModeUtils.temporarilyForceReal à la place
   */
  temporarilyForceReal(): boolean {
    console.warn('mockMode.temporarilyForceReal est déprécié');
    const wasMock = operationMode.isDemoMode;
    if (wasMock) {
      operationMode.enableRealMode();
    }
    return wasMock;
  },
  
  /**
   * @deprecated Utilisez mockModeUtils.restoreAfterForceReal à la place
   */
  restoreAfterForceReal(wasMock: boolean): void {
    console.warn('mockMode.restoreAfterForceReal est déprécié');
    if (wasMock) {
      operationMode.enableDemoMode('Restoration après force real');
    }
  },
  
  /**
   * @deprecated Utilisez mockModeUtils.isTemporarilyForcedReal à la place
   */
  isTemporarilyForcedReal(wasMock: boolean): boolean {
    return wasMock && !operationMode.isDemoMode;
  },
  
  /**
   * @deprecated Utilisez mockModeUtils.applySimulatedDelay à la place
   */
  applySimulatedDelay: async (): Promise<void> => {
    console.warn('mockMode.applySimulatedDelay est déprécié');
    const delay = originalMockMode.getDelay();
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  /**
   * @deprecated Utilisez mockModeUtils.shouldSimulateError à la place
   */
  shouldSimulateError: (): boolean => {
    console.warn('mockMode.shouldSimulateError est déprécié');
    const errorRate = originalMockMode.getErrorRate();
    return Math.random() * 100 < errorRate;
  }
};

// Re-export pour la compatibilité
export default compatibilityMockMode;
export { compatibilityMockMode as mockMode };
