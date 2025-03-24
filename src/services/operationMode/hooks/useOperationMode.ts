
import { useState, useEffect } from 'react';
import { operationMode } from '../operationModeService';
import { OperationMode } from '../index';

/**
 * Type pour le hook
 */
export interface OperationModeHook {
  // État
  mode: string;
  switchReason: string | null;
  failures: number;
  lastError: Error | null;
  settings: any;
  
  // Propriétés calculées
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Actions
  enableDemoMode: (reason?: string) => any;
  enableRealMode: () => any;
  toggle: () => any;
  handleConnectionError: (error: Error, context: string) => void;
  handleSuccessfulOperation: () => void;
  updateSettings: (settings: any) => any;
  reset: () => any;
}

/**
 * Hook React pour accéder au système de gestion des modes opérationnels
 * Fournit une interface réactive pour interagir avec operationMode
 */
export function useOperationMode(): OperationModeHook {
  const [mode, setMode] = useState<string>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<string | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<any>(operationMode.getSettings());

  // S'abonner aux changements du mode opérationnel
  useEffect(() => {
    const unsubscribe = operationMode.subscribe(() => {
      setMode(operationMode.getMode());
      setSwitchReason(operationMode.getSwitchReason());
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
