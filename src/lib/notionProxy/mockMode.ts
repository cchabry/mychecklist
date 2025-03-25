
import { operationMode } from '@/services/operationMode';

/**
 * Re-export le mockMode depuis le nouveau chemin (pour compatibilité)
 * @deprecated Utilisez operationMode depuis services/operationMode à la place
 */
export const mockMode = {
  isActive: () => operationMode.isDemoMode,
  activate: () => operationMode.enableDemoMode('Activé via ancien API mockMode'),
  deactivate: () => operationMode.enableRealMode(),
  toggle: () => operationMode.toggle(),
  forceReset: () => {
    operationMode.setDemoMode(false);
    operationMode.reset();
  },
  persist: () => operationMode.updateSettings({ persistentModeStorage: true }),
  updateConfig: () => console.warn('[DEPRECATED] mockMode.updateConfig is deprecated and has no effect'),
  temporarilyForceReal: () => operationMode.temporarilyForceReal(),
  isTemporarilyForcedReal: () => false,
  restoreAfterForceReal: (restore = true) => {
    if (restore) operationMode.setDemoMode(true);
  }
};

// Export par défaut pour la compatibilité
export default mockMode;
