
import { useState, useEffect, useCallback } from 'react';
import { operationMode } from './operationModeService';
import { OperationMode, OperationModeSettings, SwitchReason } from './types';

/**
 * Hook pour utiliser le mode opérationnel de l'application
 */
export function useOperationMode() {
  const [currentMode, setCurrentMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  
  // S'abonner aux changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((mode, reason) => {
      setCurrentMode(mode);
      setSwitchReason(reason);
      setSettings(operationMode.getSettings());
      setConsecutiveFailures(operationMode.getConsecutiveFailures());
      setLastError(operationMode.getLastError());
    });
    
    return unsubscribe;
  }, []);
  
  /**
   * Active le mode démonstration
   */
  const enableDemoMode = useCallback((reason: SwitchReason = 'Changement manuel') => {
    operationMode.enableDemoMode(reason);
  }, []);
  
  /**
   * Active le mode réel
   */
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
  }, []);
  
  /**
   * Bascule entre les modes
   */
  const toggleMode = useCallback(() => {
    operationMode.toggle();
  }, []);
  
  /**
   * Met à jour les paramètres
   */
  const updateSettings = useCallback((newSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(newSettings);
  }, []);
  
  /**
   * Signale une erreur de connexion
   */
  const handleConnectionError = useCallback((error: Error, context: string = 'Opération', isNonCritical: boolean = false) => {
    operationMode.handleConnectionError(error, context, isNonCritical);
  }, []);
  
  /**
   * Signale une opération réussie
   */
  const handleSuccessfulOperation = useCallback(() => {
    operationMode.handleSuccessfulOperation();
  }, []);
  
  return {
    // États
    mode: currentMode,
    isDemoMode: currentMode === OperationMode.DEMO,
    isRealMode: currentMode === OperationMode.REAL,
    switchReason,
    settings,
    consecutiveFailures,
    lastError,
    
    // Actions
    enableDemoMode,
    enableRealMode,
    toggleMode,
    updateSettings,
    handleConnectionError,
    handleSuccessfulOperation,
    
    // Opérations avancées
    temporarilyForceReal: useCallback(() => operationMode.temporarilyForceReal(), []),
    restorePreviousMode: useCallback(() => operationMode.restorePreviousMode(), []),
    markOperationAsCritical: useCallback((context: string) => operationMode.markOperationAsCritical(context), []),
    unmarkOperationAsCritical: useCallback((context: string) => operationMode.unmarkOperationAsCritical(context), []),
    
    // Accès au service sous-jacent
    operationMode
  };
}
