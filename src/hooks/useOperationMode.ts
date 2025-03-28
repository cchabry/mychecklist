
/**
 * Hook pour utiliser et gérer le mode d'opération
 * 
 * Ce hook permet d'accéder au mode d'opération actuel (réel ou démo)
 * et fournit des méthodes pour le modifier.
 */

import { useState, useEffect, useCallback } from 'react';
import { operationModeService } from '@/services/operationMode';
import { OperationMode, OperationModeState } from '@/types/operation';

/**
 * Interface pour le hook useOperationMode
 */
export interface UseOperationMode {
  mode: OperationMode;           // Mode actuel (real ou demo)
  state: OperationModeState;     // État complet
  isRealMode: boolean;           // True si en mode réel (API Notion)
  isDemoMode: boolean;           // True si en mode démo (données simulées)
  enableRealMode: () => void;    // Passer en mode réel
  enableDemoMode: (reason: string) => void; // Passer en mode démo avec une raison
  resetMode: () => void;         // Réinitialiser le mode
}

/**
 * Hook pour gérer le mode d'opération
 * 
 * @example
 * ```tsx
 * const { mode, isRealMode, enableDemoMode } = useOperationMode();
 * 
 * // Pour passer en mode démo
 * enableDemoMode('Choix utilisateur');
 * ```
 */
export function useOperationMode(): UseOperationMode {
  const [mode, setMode] = useState<OperationMode>(operationModeService.getMode());
  const [state, setState] = useState<OperationModeState>(operationModeService.getState());
  
  // S'abonner aux changements d'état
  useEffect(() => {
    const unsubscribe = operationModeService.subscribe((newState) => {
      setMode(newState.mode);
      setState(newState);
    });
    return unsubscribe;
  }, []);
  
  // Passer en mode réel
  const enableRealMode = useCallback(() => {
    operationModeService.enableRealMode();
  }, []);
  
  // Passer en mode démo
  const enableDemoMode = useCallback((reason: string) => {
    operationModeService.enableDemoMode(reason);
  }, []);
  
  // Réinitialiser le mode
  const resetMode = useCallback(() => {
    operationModeService.reset();
  }, []);
  
  return {
    mode,
    state,
    isRealMode: mode === 'real',
    isDemoMode: mode === 'demo',
    enableRealMode,
    enableDemoMode,
    resetMode
  };
}

export default useOperationMode;
