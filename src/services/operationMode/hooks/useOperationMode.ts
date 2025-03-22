
import { useState, useEffect, useCallback } from 'react';
import { operationMode } from '../operationModeService';
import { OperationMode, OperationModeSettings } from '../types';
import { toast } from 'sonner';

/**
 * Hook principal pour utiliser le système de mode opérationnel
 * Ce hook remplace progressivement tous les hooks liés à mockMode
 */
export function useOperationMode() {
  // États locaux
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<string | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());

  // S'abonner aux changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode, reason) => {
      setMode(newMode);
      setSwitchReason(reason);
      setFailures(operationMode.getConsecutiveFailures());
      setLastError(operationMode.getLastError());
    });

    return unsubscribe;
  }, []);

  // Méthodes
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
    toast.success('Mode réel activé', {
      description: 'L\'application se connecte maintenant à Notion'
    });
  }, []);

  const enableDemoMode = useCallback((reason: string = 'Activation manuelle') => {
    operationMode.enableDemoMode(reason);
    toast.info('Mode démonstration activé', {
      description: 'L\'application utilise maintenant des données simulées'
    });
  }, []);

  const toggle = useCallback(() => {
    operationMode.toggle();
    toast.info(operationMode.isDemoMode ? 'Mode démonstration activé' : 'Mode réel activé');
  }, []);

  const updateSettings = useCallback((newSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(newSettings);
    setSettings(operationMode.getSettings());
  }, []);

  const handleConnectionError = useCallback((error: Error, context: string = 'Opération') => {
    operationMode.handleConnectionError(error, context);
  }, []);

  const handleSuccessfulOperation = useCallback(() => {
    operationMode.handleSuccessfulOperation();
  }, []);

  // Ajouter la fonction reset
  const reset = useCallback(() => {
    operationMode.reset();
    toast.success('Réinitialisation complète', {
      description: 'Tous les paramètres du mode opérationnel ont été réinitialisés.'
    });
  }, []);

  // Retourner tous les états et méthodes
  return {
    // États
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    isDemoMode: operationMode.isDemoMode,
    isRealMode: operationMode.isRealMode,
    
    // Méthodes
    enableRealMode,
    enableDemoMode,
    toggle,
    updateSettings,
    handleConnectionError,
    handleSuccessfulOperation,
    reset,
    
    // Service brut (à utiliser avec précaution)
    operationMode
  };
}
