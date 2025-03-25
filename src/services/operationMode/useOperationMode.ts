
/**
 * Hook adapté pour utiliser l'adaptateur operationMode
 * Fournit une interface compatible avec l'ancien système
 */

import { useState, useEffect, useCallback } from 'react';
import { operationMode } from './operationModeAdapter';
import { OperationMode, OperationModeSettings, SwitchReason } from './types';

export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(operationMode.isDemoMode);
  const [switchReason, setSwitchReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());

  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode, reason) => {
      setMode(newMode);
      setIsDemoMode(newMode === OperationMode.DEMO);
      setSwitchReason(reason);
      setFailures(operationMode.getConsecutiveFailures());
      setLastError(operationMode.getLastError());
      setSettings(operationMode.getSettings());
    });
    
    return unsubscribe;
  }, []);
  
  const enableDemoMode = useCallback((reason?: string) => {
    operationMode.enableDemoMode(reason || 'Activation manuelle du mode démonstration');
  }, []);
  
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
  }, []);
  
  const toggle = useCallback(() => {
    operationMode.toggle();
  }, []);
  
  const handleConnectionError = useCallback((error: Error, context?: string, isNonCritical?: boolean) => {
    operationMode.handleConnectionError(error, context, isNonCritical);
  }, []);
  
  const handleSuccessfulOperation = useCallback(() => {
    operationMode.handleSuccessfulOperation();
  }, []);
  
  const updateSettings = useCallback((newSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(newSettings);
    setSettings({ ...settings, ...newSettings });
  }, [settings]);
  
  const reset = useCallback(() => {
    operationMode.reset();
  }, []);
  
  const temporarilyForceReal = useCallback(() => {
    operationMode.temporarilyForceReal();
  }, []);
  
  const restorePreviousMode = useCallback(() => {
    operationMode.restorePreviousMode();
  }, []);
  
  const markOperationAsCritical = useCallback((operationContext: string) => {
    operationMode.markOperationAsCritical(operationContext);
  }, []);
  
  const unmarkOperationAsCritical = useCallback((operationContext: string) => {
    operationMode.unmarkOperationAsCritical(operationContext);
  }, []);
  
  const isOperationCritical = useCallback((operationContext: string) => {
    return operationMode.isOperationCritical(operationContext);
  }, []);
  
  return {
    // États de base
    mode,
    isDemoMode,
    isRealMode: !isDemoMode,
    switchReason,
    failures,
    lastError,
    settings,
    // Pour la compatibilité avec useConnectionMode
    currentMode: mode,
    connectionHealth: {
      lastError,
      lastSuccess: null,
      consecutiveErrors: failures,
      healthyConnection: failures === 0
    },
    
    // Actions basiques
    toggle,
    enableDemoMode,
    enableRealMode,
    handleConnectionError,
    handleSuccessfulOperation,
    updateSettings,
    reset,
    
    // Actions avancées
    temporarilyForceReal,
    restorePreviousMode,
    toggleMode: toggle,
    
    // Gestion des opérations critiques
    markOperationAsCritical,
    unmarkOperationAsCritical,
    isOperationCritical
  };
}
