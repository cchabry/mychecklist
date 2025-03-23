
import { useState, useEffect } from 'react';
import { operationMode } from '../operationModeService';
import { OperationMode, OperationModeSettings } from '../types';

/**
 * Hook React pour accéder au système de gestion des modes opérationnels
 * Fournit une interface réactive pour interagir avec operationMode
 */
export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<string | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());

  // S'abonner aux changements du mode opérationnel
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

  return {
    // État
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Propriétés calculées
    isDemoMode: operationMode.isDemoMode,
    isRealMode: operationMode.isRealMode,
    
    // Actions
    enableDemoMode: operationMode.enableDemoMode.bind(operationMode),
    enableRealMode: operationMode.enableRealMode.bind(operationMode),
    toggle: operationMode.toggle.bind(operationMode),
    handleConnectionError: operationMode.handleConnectionError.bind(operationMode),
    handleSuccessfulOperation: operationMode.handleSuccessfulOperation.bind(operationMode),
    updateSettings: operationMode.updateSettings.bind(operationMode),
    reset: operationMode.reset.bind(operationMode)
  };
}
