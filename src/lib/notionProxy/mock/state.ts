
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
  }
};

export default mockState;
