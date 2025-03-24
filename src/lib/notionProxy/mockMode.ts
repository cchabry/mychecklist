
import { operationMode, OperationMode } from '@/services/operationMode';

/**
 * Gestionnaire de mode mock pour les requêtes Notion
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
    operationMode.enableDemoMode("Activé manuellement via mockMode");
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    operationMode.enableRealMode();
  },
  
  /**
   * Bascule entre les modes mock et réel
   */
  toggle(): void {
    operationMode.toggle();
  },
  
  /**
   * Force la réinitialisation du mode
   */
  forceReset(): void {
    operationMode.reset();
  },
  
  /**
   * Persiste la configuration dans le localStorage
   */
  persist(): void {
    // Mise à jour des paramètres
    operationMode.updateSettings({
      mode: operationMode.isDemoMode ? OperationMode.DEMO : OperationMode.REAL
    });
  },
  
  /**
   * Met à jour la configuration
   */
  updateConfig(config: any): void {
    operationMode.updateSettings({
      mode: config.enabled ? OperationMode.DEMO : OperationMode.REAL
    });
  },
  
  /**
   * Force temporairement le mode réel
   */
  temporarilyForceReal(): void {
    localStorage.setItem('notion_force_real', 'true');
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal(reset = false): boolean {
    const isForced = localStorage.getItem('notion_force_real') === 'true';
    
    if (reset && isForced) {
      localStorage.removeItem('notion_force_real');
    }
    
    return isForced;
  },
  
  /**
   * Restaure le mode après avoir forcé temporairement le mode réel
   */
  restoreAfterForceReal(restore = false): void {
    if (restore) {
      localStorage.removeItem('notion_force_real');
      if (operationMode.isDemoMode) {
        operationMode.enableDemoMode("Restauration après forçage temporaire du mode réel");
      }
    }
  }
};
