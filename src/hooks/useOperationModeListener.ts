
import { useState, useEffect } from 'react';
import { operationMode } from '@/services/operationMode';
import { OperationMode } from '@/services/operationMode/types';

/**
 * Hook pour écouter les changements du mode opérationnel
 * @deprecated Utiliser useOperationMode importé depuis '@/services/operationMode' à la place
 */
export function useOperationModeListener() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [reason, setReason] = useState<string | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [error, setError] = useState<Error | null>(operationMode.getLastError());

  useEffect(() => {
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.subscribe((newMode, newReason) => {
      setMode(newMode);
      setReason(newReason);
      setFailures(operationMode.getConsecutiveFailures());
      setError(operationMode.getLastError());
    });

    return unsubscribe;
  }, []);

  // Ajout des méthodes de contrôle de mode en exposant directement celles du service
  const enableRealMode = () => {
    operationMode.enableRealMode();
  };
  
  const enableDemoMode = (reason: string = 'Activation via hook') => {
    operationMode.enableDemoMode(reason);
  };

  return {
    mode,
    reason,
    failures,
    error,
    isDemoMode: operationMode.isDemoMode,
    isRealMode: operationMode.isRealMode,
    // Ajout des méthodes pour contrôler le mode
    enableRealMode,
    enableDemoMode
  };
}
