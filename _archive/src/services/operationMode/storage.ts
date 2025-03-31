
import { OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS } from './constants';

// Clés de stockage local
const STORAGE_KEYS = {
  MODE: 'operation_mode',
  REASON: 'operation_mode_reason',
  SETTINGS: 'operation_mode_settings'
};

/**
 * Service de stockage pour le système operationMode
 * Gère la persistance des paramètres et du mode opérationnel
 */
export const operationModeStorage = {
  /**
   * Sauvegarde le mode opérationnel actuel
   */
  saveMode(mode: OperationMode, reason: SwitchReason): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      
      if (reason) {
        localStorage.setItem(STORAGE_KEYS.REASON, reason);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REASON);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode opérationnel:', error);
    }
  },

  /**
   * Charge le mode opérationnel depuis le stockage local
   */
  loadMode(): { mode: OperationMode, reason: SwitchReason } {
    try {
      const mode = localStorage.getItem(STORAGE_KEYS.MODE) as OperationMode;
      const reason = localStorage.getItem(STORAGE_KEYS.REASON);
      
      return {
        mode: mode || OperationMode.REAL,
        reason: reason
      };
    } catch (error) {
      console.error('Erreur lors du chargement du mode opérationnel:', error);
      return { mode: OperationMode.REAL, reason: null };
    }
  },

  /**
   * Sauvegarde les paramètres du mode opérationnel
   */
  saveSettings(settings: OperationModeSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  },

  /**
   * Charge les paramètres du mode opérationnel
   */
  loadSettings(): OperationModeSettings {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Fusionner avec les paramètres par défaut pour s'assurer de la cohérence
        return { ...DEFAULT_SETTINGS, ...parsedSettings };
      }
      
      return { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  /**
   * Réinitialise tous les paramètres et modes
   */
  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MODE);
      localStorage.removeItem(STORAGE_KEYS.REASON);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du stockage:', error);
    }
  }
};
