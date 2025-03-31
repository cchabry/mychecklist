
import { useState, useEffect } from 'react';
import { operationModeService } from '@/services/operationMode/operationModeService';
import { OperationModeState, OperationModeType } from '@/types/operation/operationMode';

/**
 * Hook pour connaître le mode de fonctionnement de l'application (toujours en démo)
 */
export const useOperationMode = () => {
  const [state, setState] = useState<OperationModeState>(operationModeService.getState());
  
  // Propriétés dérivées de l'état
  const isDemoMode = true; // Toujours true
  const isRealMode = false; // Toujours false
  const mode: OperationModeType = 'demo'; // Toujours 'demo'
  
  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = operationModeService.subscribe(setState);
    return unsubscribe;
  }, []);
  
  const enableDemoMode = (reason?: string) => {
    operationModeService.enableDemoMode(reason);
  };
  
  const enableRealMode = () => {
    console.warn('Mode réel désactivé: l\'application fonctionne uniquement en mode démo');
    // Cette fonction ne fait rien car on est toujours en mode démo
  };
  
  const reset = () => {
    operationModeService.reset();
  };
  
  return {
    isDemoMode,
    isRealMode,
    mode,
    state,
    enableDemoMode,
    enableRealMode,
    reset
  };
};
