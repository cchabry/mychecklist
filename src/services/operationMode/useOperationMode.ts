
import { useState, useEffect } from 'react';
import { OperationMode, SwitchReason } from './types';
import { operationMode } from './operationModeService';

/**
 * Hook React pour utiliser le service operationMode
 * Fournit des fonctions et états réactifs pour interagir avec le service
 */
export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<SwitchReason | null>(
    operationMode.getSwitchReason()
  );
  const [failures, setFailures] = useState<number>(
    operationMode.getConsecutiveFailures()
  );
  const [lastError, setLastError] = useState<Error | null>(
    operationMode.getLastError()
  );
  const [settings, setSettings] = useState(operationMode.getSettings());

  // S'abonner aux changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode, reason) => {
      setMode(newMode);
      setSwitchReason(reason);
      setFailures(operationMode.getConsecutiveFailures());
      setLastError(operationMode.getLastError());
      setSettings(operationMode.getSettings());
    });
    
    return unsubscribe;
  }, []);

  // Valeurs dérivées
  const isDemoMode = mode === OperationMode.DEMO;
  const isRealMode = mode === OperationMode.REAL;

  return {
    // États
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Valeurs dérivées
    isDemoMode,
    isRealMode,
    
    // Actions
    enableDemoMode: operationMode.enableDemoMode.bind(operationMode),
    enableRealMode: operationMode.enableRealMode.bind(operationMode),
    toggle: operationMode.toggle.bind(operationMode),
    
    // Configuration
    updateSettings: operationMode.updateSettings.bind(operationMode),
    
    // Utilitaires
    reset: operationMode.reset.bind(operationMode),
    handleSuccessfulOperation: operationMode.handleSuccessfulOperation.bind(operationMode),
    handleConnectionError: operationMode.handleConnectionError.bind(operationMode)
  };
}
