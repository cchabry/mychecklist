
import { useState, useEffect } from 'react';
import { operationModeService } from './operationModeService';
import { OperationMode } from './types';

/**
 * Hook React pour interagir avec le service de mode opérationnel
 */
export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationModeService.getMode());
  const [switchReason, setSwitchReason] = useState<string | null>(operationModeService.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationModeService.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationModeService.getLastError());
  
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = operationModeService.subscribe(() => {
      setMode(operationModeService.getMode());
      setSwitchReason(operationModeService.getSwitchReason());
      setFailures(operationModeService.getConsecutiveFailures());
      setLastError(operationModeService.getLastError());
    });
    
    // Se désabonner au démontage
    return unsubscribe;
  }, []);
  
  return {
    mode,
    isDemoMode: operationModeService.isDemoMode(),
    isRealMode: operationModeService.isRealMode(),
    enableDemoMode: operationModeService.enableDemoMode.bind(operationModeService),
    enableRealMode: operationModeService.enableRealMode.bind(operationModeService),
    toggle: operationModeService.toggle.bind(operationModeService),
    settings: operationModeService.getSettings(),
    updateSettings: operationModeService.updateSettings.bind(operationModeService),
    switchReason,
    lastError,
    failures
  };
}
