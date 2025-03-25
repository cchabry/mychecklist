
/**
 * Utilitaires pour le mode opérationnel
 */

// Clé de stockage pour le mode opérationnel
export const OPERATION_MODE_STORAGE_KEY = 'operation_mode';

// Modes opérationnels possibles
export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo'
}

// Structure pour stocker la raison du changement de mode
export interface ModeChangeReason {
  timestamp: number;
  reason: string;
  previousMode: OperationMode;
  newMode: OperationMode;
}

/**
 * Sauvegarde le mode opérationnel actuel
 */
export function saveOperationMode(mode: OperationMode, reason?: string): void {
  try {
    // Récupérer l'ancien mode
    const previousMode = getOperationMode();
    
    // Sauvegarder le nouveau mode
    localStorage.setItem(OPERATION_MODE_STORAGE_KEY, mode);
    
    // Sauvegarder la raison du changement si fournie
    if (reason) {
      const modeChangeReason: ModeChangeReason = {
        timestamp: Date.now(),
        reason,
        previousMode,
        newMode: mode
      };
      
      localStorage.setItem(`${OPERATION_MODE_STORAGE_KEY}_change_reason`, 
        JSON.stringify(modeChangeReason)
      );
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du mode opérationnel:', error);
  }
}

/**
 * Récupère le mode opérationnel actuel
 */
export function getOperationMode(): OperationMode {
  try {
    const mode = localStorage.getItem(OPERATION_MODE_STORAGE_KEY);
    return mode === OperationMode.DEMO ? OperationMode.DEMO : OperationMode.REAL;
  } catch (error) {
    console.error('Erreur lors de la récupération du mode opérationnel:', error);
    return OperationMode.REAL; // Mode par défaut
  }
}

/**
 * Récupère la raison du dernier changement de mode
 */
export function getModeChangeReason(): ModeChangeReason | null {
  try {
    const reasonJson = localStorage.getItem(`${OPERATION_MODE_STORAGE_KEY}_change_reason`);
    return reasonJson ? JSON.parse(reasonJson) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la raison du changement de mode:', error);
    return null;
  }
}

/**
 * Vérifie si le mode démo est actif
 */
export function isDemoModeActive(): boolean {
  return getOperationMode() === OperationMode.DEMO;
}

/**
 * Active le mode démo
 */
export function enableDemoMode(reason?: string): void {
  saveOperationMode(OperationMode.DEMO, reason || 'Activation manuelle');
}

/**
 * Active le mode réel
 */
export function enableRealMode(reason?: string): void {
  saveOperationMode(OperationMode.REAL, reason || 'Activation manuelle');
}
