
import { operationMode } from '@/services/operationMode';

/**
 * Adaptateur de compatibilité pour l'ancien système mockMode
 * @deprecated Utilisez operationMode directement
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    return operationMode.isDemoMode;
  },
  
  /**
   * Active le mode mock
   */
  activate(): void {
    operationMode.setDemoMode(true);
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    operationMode.setDemoMode(false);
  },
  
  /**
   * Bascule le mode mock
   */
  toggle(): void {
    operationMode.toggleMode();
  },
  
  /**
   * Force la réinitialisation du mode mock
   */
  forceReset(): void {
    operationMode.setDemoMode(false);
    operationMode.reset();
  },
  
  /**
   * Persiste le mode mock
   */
  persist(): void {
    // Rien à faire, operationMode s'en charge
  },
  
  /**
   * Met à jour la configuration du mode mock
   */
  updateConfig(config: any): void {
    // Rien à faire, le concept équivalent n'existe plus
    console.warn('[DEPRECATED] mockMode.updateConfig is deprecated and has no effect');
  }
};

export default mockMode;
