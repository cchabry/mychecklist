
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
    operationMode.enableDemoMode('Activé via ancien API mockMode');
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    operationMode.enableRealMode();
  },
  
  /**
   * Bascule le mode mock
   */
  toggle(): void {
    operationMode.toggle();
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
    operationMode.updateSettings({ persistentModeStorage: true });
  },
  
  /**
   * Met à jour la configuration du mode mock
   */
  updateConfig(config: any): void {
    // Rien à faire, le concept équivalent n'existe plus
    console.warn('[DEPRECATED] mockMode.updateConfig is deprecated and has no effect');
  },
  
  /**
   * Force temporairement le mode réel (utile pour certaines opérations)
   */
  temporarilyForceReal(): void {
    operationMode.temporarilyForceReal();
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal(reset: boolean = false): boolean {
    // Cette fonctionnalité n'existe plus vraiment, mais on retourne false pour compatibilité
    return false;
  },
  
  /**
   * Restore le mode après un forçage temporaire
   */
  restoreAfterForceReal(restore: boolean = true): void {
    if (restore) {
      operationMode.setDemoMode(true);
    }
  }
};

export default mockMode;
