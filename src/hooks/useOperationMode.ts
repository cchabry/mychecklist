
/**
 * Hook pour utiliser et gérer le mode d'opération
 * 
 * Ce hook permet d'accéder au mode d'opération actuel (réel ou démo)
 * et fournit des méthodes pour le modifier.
 */

import { useState, useEffect, useCallback } from 'react';
import { operationModeService } from '@/services/operationMode';
import { OperationMode, OperationModeState, UseOperationMode } from '@/types/operation';

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
  const enableRealMode = useCallback((reason?: string) => {
    operationModeService.enableRealMode(reason);
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
    reset: resetMode
  };
}

export default useOperationMode;
