
import { operationMode } from '@/services/operationMode';
import { SwitchReason } from '@/lib/operationMode/types';

/**
 * Vérifie si le mode mock est actif (pour compatibilité)
 */
export const isMockActive = (): boolean => {
  return operationMode.isDemoMode;
};

/**
 * Désactive temporairement le mode mock
 */
export const temporarilyDisableMock = (): void => {
  operationMode.enableRealMode();
};

/**
 * Active le mode mock
 */
export const enableMock = (): void => {
  operationMode.enableDemoMode(SwitchReason.MANUAL_API);
};
