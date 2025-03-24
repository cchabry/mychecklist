
import { useEffect, useState } from 'react';
import { operationMode, OperationMode } from '@/services/operationMode';

/**
 * Hook qui écoute les changements du mode opérationnel
 * et met à jour l'état local en conséquence
 */
export function useOperationModeListener() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(operationMode.isDemoMode);
  
  useEffect(() => {
    // S'abonner aux changements du mode opérationnel
    const unsubscribe = operationMode.subscribe(() => {
      setMode(operationMode.getMode());
      setIsDemoMode(operationMode.isDemoMode);
    });
    
    // Se désabonner lors du démontage du composant
    return unsubscribe;
  }, []);
  
  return {
    mode,
    isDemoMode
  };
}
