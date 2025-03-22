
import { mockMode } from './mock';
import { operationMode } from '@/services/operationMode';

/**
 * Version de compatibilité pour assurer la transition vers le nouveau système
 * @deprecated Utilisez operationMode à la place
 */
const compatibilityMockMode = {
  ...mockMode,
  
  /**
   * @deprecated Utilisez operationMode.isDemoMode() à la place
   */
  isActive(): boolean {
    console.warn('mockMode.isActive est déprécié. Utilisez operationMode.isDemoMode() à la place');
    return operationMode.isDemoMode();
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
    const newMode = operationMode.toggle();
    return operationMode.isDemoMode();
  }
};

// Re-export pour la compatibilité
export default compatibilityMockMode;
export { compatibilityMockMode as mockMode };
