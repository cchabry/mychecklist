
/**
 * Adaptateur pour maintenir la compatibilité avec l'ancienne interface mockMode
 * tout en utilisant le nouveau operationMode
 */

import { operationMode } from '@/services/operationMode';

/**
 * Interface complète de l'ancien mockMode
 * pour la compatibilité avec le code existant
 */
export interface LegacyMockModeInterface {
  isActive(): boolean;
  activate(): void;
  deactivate(): void;
  toggle(): void;
  forceReset(): void;
  persist(): void;
  updateConfig(config: any): void;
  temporarilyForceReal(): void;
  isTemporarilyForcedReal(reset?: boolean): boolean;
  restoreAfterForceReal(restore?: boolean): void;
  _tempForcedRealStatus?: boolean; // Propriété privée pour tracking interne
}

/**
 * Adaptateur qui implémente l'interface LegacyMockMode
 * en se basant sur le nouveau operationMode
 */
export const mockModeAdapter: LegacyMockModeInterface = {
  // Variables d'état privées
  _tempForcedRealStatus: false,
  
  isActive(): boolean {
    return operationMode.isDemoMode;
  },
  
  activate(): void {
    operationMode.enableDemoMode('Activation via mockMode legacy API');
  },
  
  deactivate(): void {
    operationMode.enableRealMode();
  },
  
  toggle(): void {
    operationMode.toggle();
  },
  
  forceReset(): void {
    operationMode.setDemoMode(false);
    operationMode.reset();
    this._tempForcedRealStatus = false;
  },
  
  persist(): void {
    operationMode.updateSettings({ persistentModeStorage: true });
  },
  
  updateConfig(config: any): void {
    console.warn('[DEPRECATED] mockMode.updateConfig is deprecated and has no effect');
  },
  
  temporarilyForceReal(): void {
    const wasDemoMode = operationMode.isDemoMode;
    if (wasDemoMode) {
      this._tempForcedRealStatus = true;
      operationMode.enableRealMode();
    }
  },
  
  isTemporarilyForcedReal(reset: boolean = false): boolean {
    const status = this._tempForcedRealStatus;
    
    if (reset && status) {
      this._tempForcedRealStatus = false;
    }
    
    return status;
  },
  
  restoreAfterForceReal(restore: boolean = true): void {
    if (this._tempForcedRealStatus) {
      this._tempForcedRealStatus = false;
      
      if (restore) {
        operationMode.enableDemoMode('Restauration après forçage temporaire');
      }
    }
  }
};

/**
 * Pour compatibilité avec l'ancien système
 */
export default mockModeAdapter;
