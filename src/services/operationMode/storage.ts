
import { OperationMode, SwitchReason } from './types';
import { STORAGE_KEYS } from './constants';

/**
 * Utilitaires pour gérer le stockage local du mode opérationnel
 */
export const operationModeStorage = {
  /**
   * Charge le mode depuis le stockage local
   */
  loadMode: (): { mode: OperationMode | null; reason: SwitchReason | null } => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.MODE);
      const savedReason = localStorage.getItem(STORAGE_KEYS.REASON);
      
      if (savedMode === OperationMode.DEMO) {
        return {
          mode: OperationMode.DEMO,
          reason: savedReason || 'Mode démo activé manuellement'
        };
      }
      
      return { mode: null, reason: null };
    } catch (e) {
      console.warn('Impossible de charger le mode depuis localStorage:', e);
      return { mode: null, reason: null };
    }
  },
  
  /**
   * Sauvegarde le mode dans le stockage local
   */
  saveMode: (mode: OperationMode, reason: SwitchReason | null): void => {
    try {
      if (mode === OperationMode.DEMO) {
        localStorage.setItem(STORAGE_KEYS.MODE, mode);
        if (reason) {
          localStorage.setItem(STORAGE_KEYS.REASON, reason);
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.MODE);
        localStorage.removeItem(STORAGE_KEYS.REASON);
      }
    } catch (e) {
      console.warn('Impossible de sauvegarder le mode dans localStorage:', e);
    }
  },
  
  /**
   * Efface les données du mode opérationnel du stockage local
   */
  clearMode: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.MODE);
      localStorage.removeItem(STORAGE_KEYS.REASON);
    } catch (e) {
      console.warn('Impossible de supprimer le mode du localStorage:', e);
    }
  }
};
