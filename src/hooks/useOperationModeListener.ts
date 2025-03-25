
import { useState, useEffect } from 'react';
import { operationMode } from '@/services/operationMode';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook pour écouter les changements de mode opérationnel
 * et fournir des méthodes simples pour interagir avec le mode
 */
export function useOperationModeListener() {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(operationMode.isDemoMode);
  const { toggle, enableRealMode, enableDemoMode } = useOperationMode();

  // S'abonner aux changements du mode opérationnel
  useEffect(() => {
    const unsubscribe = operationMode.addListener((mode) => {
      setIsDemoMode(operationMode.isDemoMode);
    });
    return unsubscribe;
  }, []);

  return {
    isDemoMode,
    toggleMode: toggle,
    enableRealMode,
    enableDemoMode
  };
}
