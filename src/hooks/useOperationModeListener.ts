
import { useState, useEffect } from 'react';
import { OperationMode, SwitchReason } from '@/services/operationMode/types';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour écouter les changements de mode opérationnel
 */
export const useOperationModeListener = () => {
  const [currentMode, setCurrentMode] = useState<OperationMode>(operationMode.getMode());
  const [reason, setReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());
  
  useEffect(() => {
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.subscribe((mode, switchReason) => {
      setCurrentMode(mode);
      setReason(switchReason);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    currentMode,
    isDemoMode: currentMode === OperationMode.DEMO,
    isRealMode: currentMode === OperationMode.REAL,
    switchReason: reason,
    
    // Fonctions de commodité
    enableDemoMode: (reason?: SwitchReason) => operationMode.enableDemoMode(reason),
    enableRealMode: () => operationMode.enableRealMode(),
    toggleMode: () => operationMode.toggle()
  };
};

export default useOperationModeListener;
