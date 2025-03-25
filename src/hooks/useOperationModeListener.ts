
import { useState, useEffect } from 'react';
import { operationMode } from '@/services/operationMode';
import { OperationMode, SwitchReason } from '@/services/operationMode/types';

/**
 * Hook pour surveiller les changements de mode opérationnel
 * Version simplifiée du hook useOperationMode qui ne s'intéresse qu'au mode actif
 */
export const useOperationModeListener = () => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(operationMode.isDemoMode());
  const [reason, setReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());

  useEffect(() => {
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.subscribe((newMode: OperationMode, newReason: SwitchReason | null) => {
      setIsDemoMode(newMode === OperationMode.DEMO);
      setReason(newReason);
    });
    
    // Se désabonner à la destruction du composant
    return unsubscribe;
  }, []);

  return {
    isDemoMode,
    isRealMode: !isDemoMode,
    reason
  };
};

export default useOperationModeListener;
