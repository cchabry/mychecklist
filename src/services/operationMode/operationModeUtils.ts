
import { OperationMode } from './types';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

/**
 * Utilitaires pour le service de mode d'opération
 */
export const operationModeUtils = {
  /**
   * Vérifie si le mode mock est actif
   */
  isMockActive(): boolean {
    // Vérifier dans localStorage
    return localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true';
  },

  /**
   * Obtient le mode actuel
   */
  getMode(): OperationMode {
    return this.isMockActive() ? OperationMode.DEMO : OperationMode.REAL;
  }
};
