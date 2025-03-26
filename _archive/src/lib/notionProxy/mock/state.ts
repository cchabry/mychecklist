
import { operationMode } from '@/services/operationMode';

/**
 * Objet de compatibilité pour l'ancien système mockMode
 * @deprecated Utilisez operationMode à la place
 */
export const mockState = {
  get isActive() {
    return operationMode.isDemoMode;
  },
  set isActive(value: boolean) {
    operationMode.setDemoMode(value);
  },

  // Méthodes de compatibilité
  setActive: function(value: boolean) {
    operationMode.setDemoMode(value);
  },
  
  setPermanent: function(value: boolean) {
    // Persistance est maintenant gérée via les settings
    operationMode.updateSettings({ 
      persistentModeStorage: value 
    });
  },
  
  isPermanent: function() {
    return operationMode.getSettings().persistentModeStorage;
  },
  
  updateConfig: function(config: any) {
    // Déléguer à operationMode
    console.warn('[DEPRECATED] mockState.updateConfig is deprecated');
  },
  
  getConfig: function() {
    // Retourner un objet compatible avec l'ancien format
    return {};
  }
};

export interface MockConfig {
  // Configuration mock anciennement utilisée
  errorRate?: number;
  delay?: number;
}

export default mockState;
