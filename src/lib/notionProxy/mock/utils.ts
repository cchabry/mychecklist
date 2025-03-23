
import { operationMode } from '@/services/operationMode';

/**
 * Vérifie si le mode mock est actif (compatibilité)
 * @deprecated Utilisez operationMode.isDemoMode à la place
 */
export function isMockActive(): boolean {
  return operationMode.isDemoMode;
}

/**
 * Désactive temporairement le mode mock (compatibilité)
 * @deprecated Utilisez operationMode.setDemoMode(false) à la place
 */
export function temporarilyDisableMock(): void {
  operationMode.setDemoMode(false);
}

/**
 * Active temporairement le mode mock (compatibilité)
 * @deprecated Utilisez operationMode.setDemoMode(true) à la place
 */
export function temporarilyEnableMock(): void {
  operationMode.setDemoMode(true);
}
