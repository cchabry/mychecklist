
import { useState, useEffect, useCallback } from 'react';
import { UseOperationMode } from '@/types/operation/operationMode';
import { operationModeService } from '@/services/operationMode/operationModeService';

/**
 * Hook pour utiliser le service de mode opérationnel
 */
export function useOperationMode(): UseOperationMode {
  const [state, setState] = useState(operationModeService.getState());
  
  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = operationModeService.subscribe(setState);
    return unsubscribe;
  }, []);
  
  const enableRealMode = useCallback((reason?: string) => {
    operationModeService.enableRealMode(reason);
  }, []);
  
  const enableDemoMode = useCallback((reason?: string) => {
    operationModeService.enableDemoMode(reason);
  }, []);
  
  const reset = useCallback(() => {
    operationModeService.reset();
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
