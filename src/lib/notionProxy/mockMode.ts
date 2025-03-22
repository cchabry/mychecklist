
import { mockUtils } from './mock/utils';
import { mockModeAdapter } from './mockModeAdapter';
import { operationMode } from '@/services/operationMode';

/**
 * Version de compatibilité pour assurer la transition vers le nouveau système
 * @deprecated Utilisez operationMode à la place
 */
const compatibilityMockMode = {
  /**
   * @deprecated Utilisez operationMode.isDemoMode à la place
   */
  isActive: function() {
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
    operationMode.reset();
  },
  
  /**
   * @deprecated Utilisez mockUtils.temporarilyForceReal à la place
   */
  temporarilyForceReal(): boolean {
    console.warn('mockMode.temporarilyForceReal est déprécié');
    return mockUtils.temporarilyForceReal();
  },
  
  /**
   * @deprecated Utilisez mockUtils.restoreAfterForceReal à la place
   */
  restoreAfterForceReal(wasMock: boolean): void {
    console.warn('mockMode.restoreAfterForceReal est déprécié');
    mockUtils.restoreAfterForceReal(wasMock);
  },
  
  /**
   * @deprecated Utilisez mockUtils.isTemporarilyForcedReal à la place
   */
  isTemporarilyForcedReal(wasMock: boolean): boolean {
    return wasMock && !operationMode.isDemoMode;
  },
  
  // Fonctions de configuration du mode mock (déléguées à l'adaptateur)
  getDelay: mockModeAdapter.getDelay,
  setDelay: mockModeAdapter.setDelay,
  getScenario: mockModeAdapter.getScenario,
  setScenario: mockModeAdapter.setScenario,
  getErrorRate: mockModeAdapter.getErrorRate,
  setErrorRate: mockModeAdapter.setErrorRate,
  
  /**
   * @deprecated Utilisez mockUtils.applySimulatedDelay à la place
   */
  applySimulatedDelay: async (): Promise<void> => {
    console.warn('mockMode.applySimulatedDelay est déprécié');
    await mockUtils.applySimulatedDelay();
  },
  
  /**
   * @deprecated Utilisez mockUtils.shouldSimulateError à la place
   */
  shouldSimulateError: (): boolean => {
    console.warn('mockMode.shouldSimulateError est déprécié');
    return mockUtils.shouldSimulateError();
  }
};

// Re-export pour la compatibilité
export default compatibilityMockMode;
export { compatibilityMockMode as mockMode };
