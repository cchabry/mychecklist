
import { OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS } from './constants';

// Clés de stockage local
const MODE_KEY = 'operation_mode';
const REASON_KEY = 'operation_mode_reason';
const SETTINGS_KEY = 'operation_mode_settings';

/**
 * Utilitaires pour le stockage persistant du mode opérationnel
 */
export const operationModeStorage = {
  /**
   * Sauvegarde le mode opérationnel et la raison
   */
  saveMode(mode: OperationMode, reason: SwitchReason | null): void {
    localStorage.setItem(MODE_KEY, mode);
    
    if (reason) {
      localStorage.setItem(REASON_KEY, reason);
    } else {
      localStorage.removeItem(REASON_KEY);
    }
  },
  
  /**
   * Charge le mode opérationnel et la raison
   */
  loadMode(): { mode: OperationMode, reason: SwitchReason | null } {
    const savedMode = localStorage.getItem(MODE_KEY) as OperationMode | null;
    const savedReason = localStorage.getItem(REASON_KEY);
    
    return {
      mode: savedMode || OperationMode.REAL,
      reason: savedReason
    };
  },
  
  /**
   * Sauvegarde les paramètres
   */
  saveSettings(settings: OperationModeSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  
  /**
   * Charge les paramètres
   */
  loadSettings(): OperationModeSettings {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      
      if (savedSettings) {
        return {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(savedSettings)
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
    
    return { ...DEFAULT_SETTINGS };
  },
  
  /**
   * Efface toutes les données de mode opérationnel
   */
  clear(): void {
    localStorage.removeItem(MODE_KEY);
    localStorage.removeItem(REASON_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
};
