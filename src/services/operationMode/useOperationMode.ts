
import { useState, useEffect } from 'react';
import { operationMode } from './operationModeService';
import { OperationMode, OperationModeSettings } from './types';

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

  /**
   * Active le mode démonstration
   */
  const enableDemoMode = (reason?: string) => {
    operationMode.enableDemoMode(reason);
  };

  /**
   * Active le mode réel
   */
  const enableRealMode = () => {
    operationMode.enableRealMode();
  };

  /**
   * Bascule entre les modes réel et démo
   */
  const toggle = () => {
    operationMode.toggle();
  };

  /**
   * Signale une erreur de connexion
   */
  const handleConnectionError = (error: Error, context?: string) => {
    operationMode.handleConnectionError(error, context);
  };

  /**
   * Signale une opération réussie
   */
  const handleSuccessfulOperation = () => {
    operationMode.handleSuccessfulOperation();
  };

  /**
   * Met à jour les paramètres
   */
  const updateSettings = (newSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(newSettings);
    setSettings(operationMode.getSettings());
  };

  /**
   * Réinitialise complètement le service
   */
  const reset = () => {
    operationMode.reset();
  };

  return {
    // État
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Propriétés calculées
    isDemoMode: operationMode.isDemoMode(),
    isRealMode: operationMode.isRealMode(),
    
    // Actions
    enableDemoMode,
    enableRealMode,
    toggle,
    handleConnectionError,
    handleSuccessfulOperation,
    updateSettings,
    reset
  };
}
