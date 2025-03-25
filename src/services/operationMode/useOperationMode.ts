
import { useState, useEffect, useCallback } from 'react';
import { operationMode } from './operationModeAdapter';
import { OperationMode, OperationModeSettings, SwitchReason, OperationModeHook } from './types';

/**
 * Hook React pour accéder au système de gestion des modes opérationnels
 * Fournit une interface réactive pour interagir avec operationMode
 */
export function useOperationMode(): OperationModeHook {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());

  // Valeurs calculées
  const isDemoMode = mode === OperationMode.DEMO;
  const isRealMode = mode === OperationMode.REAL;
  
  // État de la connexion pour compatibilité
  const connectionHealth = {
    lastError,
    lastSuccess: null as Date | null,
    consecutiveErrors: failures,
    healthyConnection: failures < 3
  };

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

  // Méthodes d'action
  const enableDemoMode = useCallback((reason?: string) => {
    operationMode.enableDemoMode(reason);
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
  
  const updateSettings = useCallback((partialSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(partialSettings);
  }, []);
  
  const reset = useCallback(() => {
    operationMode.reset();
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
  
  const temporarilyForceReal = useCallback(() => {
    operationMode.temporarilyForceReal();
  }, []);
  
  const restorePreviousMode = useCallback(() => {
    operationMode.restorePreviousMode();
  }, []);
  
  // Aliases pour la compatibilité
  const currentMode = mode;
  const toggleMode = toggle;
  const restoreMode = restorePreviousMode;

  return {
    // État
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Propriétés calculées
    isDemoMode,
    isRealMode,
    currentMode,
    connectionHealth,
    
    // Actions
    enableDemoMode,
    enableRealMode,
    toggle,
    toggleMode,
    handleConnectionError,
    handleSuccessfulOperation,
    updateSettings,
    reset,
    markOperationAsCritical,
    unmarkOperationAsCritical,
    isOperationCritical,
    temporarilyForceReal,
    restorePreviousMode,
    restoreMode
  };
}
