
import { OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS } from './constants';

// Clés de stockage localStorage
const MODE_STORAGE_KEY = 'operation_mode';
const REASON_STORAGE_KEY = 'operation_mode_reason';
const SETTINGS_STORAGE_KEY = 'operation_mode_settings';

/**
 * Utilities pour la persistance du mode opérationnel
 */
export const operationModeStorage = {
  /**
   * Sauvegarde le mode opérationnel dans le localStorage
   */
  saveMode(mode: OperationMode, reason: SwitchReason | null): void {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode.toString());
      
      if (reason) {
        localStorage.setItem(REASON_STORAGE_KEY, reason);
      } else {
        localStorage.removeItem(REASON_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode opérationnel:', error);
    }
  },
  
  /**
   * Charge le mode opérationnel depuis le localStorage
   */
  loadMode(): { mode: OperationMode; reason: SwitchReason | null } {
    try {
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      const savedReason = localStorage.getItem(REASON_STORAGE_KEY);
      
      if (savedMode && Object.values(OperationMode).includes(savedMode as OperationMode)) {
        return {
          mode: savedMode as OperationMode,
          reason: savedReason as SwitchReason
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement du mode opérationnel:', error);
    }
    
    // Valeur par défaut en cas d'erreur ou si aucune valeur n'est stockée
    return {
      mode: OperationMode.REAL,
      reason: null
    };
  },
  
  /**
   * Sauvegarde les paramètres dans le localStorage
   */
  saveSettings(settings: OperationModeSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  },
  
  /**
   * Charge les paramètres depuis le localStorage
   */
  loadSettings(): OperationModeSettings {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (savedSettings) {
        // Fusionner avec les paramètres par défaut pour garantir la validité
        return {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(savedSettings)
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
    
    // Valeur par défaut en cas d'erreur
    return { ...DEFAULT_SETTINGS };
  },
  
  /**
   * Efface toutes les données de stockage liées au mode opérationnel
   */
  clearStorage(): void {
    try {
      localStorage.removeItem(MODE_STORAGE_KEY);
      localStorage.removeItem(REASON_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données de stockage:', error);
    }
  }
};
