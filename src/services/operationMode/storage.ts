
import { OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

/**
 * Utilitaires pour la persistance du mode opérationnel
 */
export const operationModeStorage = {
  /**
   * Sauvegarde le mode opérationnel dans le stockage local
   */
  saveMode(mode: OperationMode, reason: SwitchReason | null = null): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      
      if (reason) {
        localStorage.setItem(STORAGE_KEYS.REASON, reason);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REASON);
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du mode opérationnel:', error);
    }
  },
  
  /**
   * Charge le mode opérationnel depuis le stockage local
   */
  loadMode(): { mode: OperationMode; reason: SwitchReason | null } {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEYS.MODE);
      const storedReason = localStorage.getItem(STORAGE_KEYS.REASON);
      
      if (storedMode === OperationMode.DEMO) {
        return { 
          mode: OperationMode.DEMO, 
          reason: storedReason || 'Chargé depuis stockage local' 
        };
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du mode opérationnel:', error);
    }
    
    // Par défaut, retourner le mode réel
    return { mode: OperationMode.REAL, reason: null };
  },
  
  /**
   * Sauvegarde les paramètres dans le stockage local
   */
  saveSettings(settings: OperationModeSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des paramètres:', error);
    }
  },
  
  /**
   * Charge les paramètres depuis le stockage local
   */
  loadSettings(): OperationModeSettings {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (storedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des paramètres:', error);
    }
    
    return { ...DEFAULT_SETTINGS };
  },
  
  /**
   * Efface toutes les données du stockage local
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MODE);
      localStorage.removeItem(STORAGE_KEYS.REASON);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.warn('Erreur lors de la suppression des données:', error);
    }
  }
};
