
// Ajoutons des logs au mockMode adapter et améliorons la gestion des forçages temporaires

import { operationMode } from '@/services/operationMode';

/**
 * Adaptateur de compatibilité pour l'ancien système mockMode
 * @deprecated Utilisez operationMode directement
 */
export const mockMode = {
  // Statut du forçage temporaire pour la compatibilité
  _tempForcedRealStatus: false,
  
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    const isDemoMode = operationMode.isDemoMode;
    console.log('🔍 [DEBUG] mockMode.isActive() appelé - retourne:', isDemoMode);
    return isDemoMode;
  },
  
  /**
   * Active le mode mock
   */
  activate(): void {
    console.log('🔍 [DEBUG] mockMode.activate() appelé');
    operationMode.enableDemoMode('Activé via ancien API mockMode');
    console.log('🔍 [DEBUG] Après enableDemoMode, mode actif?', operationMode.isDemoMode);
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    console.log('🔍 [DEBUG] mockMode.deactivate() appelé');
    operationMode.enableRealMode();
    console.log('🔍 [DEBUG] Après enableRealMode, mode actif?', operationMode.isDemoMode);
  },
  
  /**
   * Bascule le mode mock
   */
  toggle(): void {
    console.log('🔍 [DEBUG] mockMode.toggle() appelé');
    operationMode.toggle();
    console.log('🔍 [DEBUG] Après toggle, mode actif?', operationMode.isDemoMode);
  },
  
  /**
   * Force la réinitialisation du mode mock
   */
  forceReset(): void {
    console.log('🔍 [DEBUG] mockMode.forceReset() appelé');
    operationMode.setDemoMode(false);
    operationMode.reset();
    this._tempForcedRealStatus = false;
    console.log('🔍 [DEBUG] Après reset, mode actif?', operationMode.isDemoMode);
  },
  
  /**
   * Persiste le mode mock
   */
  persist(): void {
    console.log('🔍 [DEBUG] mockMode.persist() appelé');
    // Rien à faire, operationMode s'en charge
    operationMode.updateSettings({ persistentModeStorage: true });
  },
  
  /**
   * Met à jour la configuration du mode mock
   */
  updateConfig(config: any): void {
    console.log('🔍 [DEBUG] mockMode.updateConfig() appelé (déprécié)');
    // Rien à faire, le concept équivalent n'existe plus
    console.warn('[DEPRECATED] mockMode.updateConfig is deprecated and has no effect');
  },
  
  /**
   * Force temporairement le mode réel (utile pour certaines opérations)
   */
  temporarilyForceReal(): void {
    console.log('🔍 [DEBUG] mockMode.temporarilyForceReal() appelé');
    this._tempForcedRealStatus = true;
    operationMode.temporarilyForceReal();
    console.log('🔍 [DEBUG] Après temporarilyForceReal, mode actif?', operationMode.isDemoMode);
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal(reset: boolean = false): boolean {
    console.log('🔍 [DEBUG] mockMode.isTemporarilyForcedReal() appelé', 
      reset ? '(avec reset)' : '');
    
    const status = this._tempForcedRealStatus;
    
    if (reset && status) {
      this._tempForcedRealStatus = false;
      console.log('🔍 [DEBUG] Réinitialisation du statut de forçage temporaire');
    }
    
    return status;
  },
  
  /**
   * Restore le mode après un forçage temporaire
   */
  restoreAfterForceReal(restore: boolean = true): void {
    console.log('🔍 [DEBUG] mockMode.restoreAfterForceReal() appelé avec restore =', restore);
    
    // Vérifier si nous étions en forçage temporaire
    if (this._tempForcedRealStatus) {
      this._tempForcedRealStatus = false;
      
      if (restore) {
        operationMode.setDemoMode(true);
        console.log('🔍 [DEBUG] Après setDemoMode(true), mode actif?', operationMode.isDemoMode);
      } else {
        console.log('🔍 [DEBUG] Restauration annulée, mode actif?', operationMode.isDemoMode);
      }
    } else {
      console.log('🔍 [DEBUG] Aucun forçage temporaire à restaurer');
    }
  }
};

export default mockMode;
