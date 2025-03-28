
import { useState, useEffect, useCallback } from 'react';
import { operationModeService } from '@/services/operationMode/operationModeService';
import { OperationModeType, OperationModeState } from '@/services/operationMode/operationModeService';

/**
 * Interface du hook useOperationMode
 */
export interface UseOperationMode {
  mode: OperationModeType;
  state: OperationModeState;
  isDemoMode: boolean;
  isRealMode: boolean;
  enableDemoMode: (reason?: string) => void;
  enableRealMode: (reason?: string) => void;
  reset: (reason?: string) => void;
}

/**
 * Hook pour accéder et modifier le mode opérationnel de l'application
 * 
 * Ce hook permet d'interagir avec le service de mode opérationnel
 * depuis les composants React.
 * 
 * Exemple d'utilisation:
 * ```tsx
 * const { isDemoMode, enableRealMode } = useOperationMode();
 * 
 * // Affichage conditionnel selon le mode
 * if (isDemoMode) {
 *   return <div>Mode démo actif</div>;
 * }
 * 
 * // Changer le mode
 * const handleSwitchToReal = () => {
 *   enableRealMode("Passage en production");
 * };
 * ```
 */
export const useOperationMode = (): UseOperationMode => {
  const [mode, setMode] = useState<OperationModeType>(operationModeService.getMode());
  const [state, setState] = useState<OperationModeState>(operationModeService.getState());

  // S'abonner aux changements d'état du service
  useEffect(() => {
    const unsubscribe = operationModeService.subscribe((newState: OperationModeState) => {
      setMode(newState.mode);
      setState(newState);
    });
    
    // Se désabonner à la destruction du composant
    return unsubscribe;
  }, []);

  // Fonctions pour changer le mode
  const enableDemoMode = useCallback((reason?: string) => {
    operationModeService.enableDemoMode(reason || "Changement en mode démo");
  }, []);

  const enableRealMode = useCallback((reason?: string) => {
    operationModeService.enableRealMode(reason || "Changement en mode réel");
  }, []);

  const reset = useCallback((reason?: string) => {
    operationModeService.reset(reason);
  }, []);

  // Valeurs dérivées
  const isDemoMode = mode === 'demo';
  const isRealMode = mode === 'real';

  return {
    mode,
    state,
    isDemoMode,
    isRealMode,
    enableDemoMode,
    enableRealMode,
    reset
  };
};

export default useOperationMode;
