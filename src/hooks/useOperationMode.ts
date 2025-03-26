
import { useState, useEffect, useCallback } from 'react';
import { OperationModeType, OperationModeState, UseOperationMode } from '@/types/operationMode';

// Stub for the service operationMode (to be implemented later)
const operationMode = {
  getMode: () => 'real' as OperationModeType,
  getState: () => ({
    mode: 'real' as OperationModeType,
    timestamp: Date.now(),
    source: 'system' as const
  }),
  enableRealMode: () => {},
  enableDemoMode: () => {},
  reset: () => {},
  isDemoMode: () => false,
  isRealMode: () => true,
  subscribe: (callback: any) => () => {}
};

/**
 * Hook pour utiliser le service de mode opérationnel
 */
export function useOperationMode(): UseOperationMode {
  const [state, setState] = useState<OperationModeState>(operationMode.getState());
  
  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = operationMode.subscribe(setState);
    return unsubscribe;
  }, []);
  
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
  }, []);
  
  const enableDemoMode = useCallback(() => {
    operationMode.enableDemoMode();
  }, []);
  
  const reset = useCallback(() => {
    operationMode.reset();
  }, []);
  
  return {
    mode: state.mode,
    state,
    isDemoMode: state.mode === 'demo',
    isRealMode: state.mode === 'real',
    enableRealMode,
    enableDemoMode,
    reset
  };
}
