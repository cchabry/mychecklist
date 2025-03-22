
import { useState, useEffect } from 'react';
import { operationModeService } from './operationModeService';
import { OperationMode } from './types';

/**
 * Hook React pour interagir avec le service de mode opérationnel
 */
export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationModeService.mode);
  const [switchReason, setSwitchReason] = useState<string | null>(operationModeService.switchReason);
  const [failures, setFailures] = useState<number>(operationModeService.failures);
  const [lastError, setLastError] = useState<Error | null>(operationModeService.lastError);
  
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = operationModeService.subscribe(() => {
      setMode(operationModeService.mode);
      setSwitchReason(operationModeService.switchReason);
      setFailures(operationModeService.failures);
      setLastError(operationModeService.lastError);
    });
    
    // Se désabonner au démontage
    return unsubscribe;
  }, []);
  
  return {
    mode,
    isDemoMode: operationModeService.isDemoMode,
    isRealMode: operationModeService.isRealMode,
    enableDemoMode: operationModeService.enableDemoMode,
    enableRealMode: operationModeService.enableRealMode,
    toggle: operationModeService.toggle,
    handleConnectionError: operationModeService.handleConnectionError,
    handleSuccessfulOperation: operationModeService.handleSuccessfulOperation,
    settings: operationModeService.settings,
    updateSettings: operationModeService.updateSettings,
    switchReason,
    lastError,
    failures,
    isTransitioning: operationModeService.isTransitioning
  };
}
