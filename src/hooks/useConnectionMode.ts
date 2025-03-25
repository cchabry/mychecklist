
import { useState, useEffect, useCallback } from 'react';
import { connectionModeService } from '@/services/connection/connectionModeService';
import { ConnectionMode, ConnectionHealth, ModeChangeEvent } from '@/services/connection/types';
import { OperationMode } from '@/services/operationMode/types';

/**
 * Hook pour utiliser le service de mode de connexion
 * Remplace useOperationMode avec une interface simplifiée
 */
export function useConnectionMode() {
  const [currentMode, setCurrentMode] = useState<ConnectionMode>(connectionModeService.getMode());
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>(
    connectionModeService.getConnectionHealth()
  );
  const [switchReason, setSwitchReason] = useState<string | null>(null);
  
  // Pour compatibilité avec ancien système
  const mode = currentMode === ConnectionMode.DEMO ? OperationMode.DEMO : OperationMode.REAL;
  const isDemoMode = currentMode === ConnectionMode.DEMO;
  const isRealMode = currentMode === ConnectionMode.REAL;
  const failures = connectionHealth.consecutiveErrors;
  const lastError = connectionHealth.lastError;
  
  // Mettre à jour le mode local lorsqu'il change dans le service
  useEffect(() => {
    const unsubscribe = connectionModeService.subscribe((event: ModeChangeEvent) => {
      setCurrentMode(event.currentMode);
      setSwitchReason(event.reason);
      
      // Mettre à jour également l'état de santé car il peut changer avec le mode
      setConnectionHealth(connectionModeService.getConnectionHealth());
    });
    
    return unsubscribe;
  }, []);
  
  // Fonction pour basculer entre les modes
  const toggleMode = useCallback(() => {
    connectionModeService.toggleMode();
  }, []);
  
  // Fonction pour activer le mode démo
  const enableDemoMode = useCallback((reason?: string) => {
    connectionModeService.enableDemoMode(reason);
  }, []);
  
  // Fonction pour activer le mode réel
  const enableRealMode = useCallback(() => {
    connectionModeService.enableRealMode();
  }, []);
  
  // Fonction pour temporairement forcer le mode réel
  const temporarilyForceReal = useCallback(() => {
    connectionModeService.temporarilyForceReal();
  }, []);
  
  // Fonction pour restaurer le mode après un forçage temporaire
  const restoreMode = useCallback(() => {
    connectionModeService.restoreMode();
  }, []);
  
  // Fonction pour signaler une erreur de connexion
  const handleConnectionError = useCallback((error: Error, context?: string) => {
    connectionModeService.handleConnectionError(error);
    // Mettre à jour l'état de santé
    setConnectionHealth(connectionModeService.getConnectionHealth());
  }, []);
  
  // Fonction pour signaler une opération réussie
  const handleSuccessfulOperation = useCallback(() => {
    connectionModeService.handleSuccessfulOperation();
    // Mettre à jour l'état de santé
    setConnectionHealth(connectionModeService.getConnectionHealth());
  }, []);
  
  const resetConnectionHealth = useCallback(() => {
    connectionModeService.handleSuccessfulOperation();
    setConnectionHealth(connectionModeService.getConnectionHealth());
  }, []);
  
  // Alias pour compatibilité
  const toggle = toggleMode;
  const reset = resetConnectionHealth;
  
  // Simulation des opérations critiques (non implémentées dans connectionModeService)
  const criticalOperations = new Set<string>();
  
  const markOperationAsCritical = useCallback((operationContext: string) => {
    criticalOperations.add(operationContext);
  }, []);
  
  const unmarkOperationAsCritical = useCallback((operationContext: string) => {
    criticalOperations.delete(operationContext);
  }, []);
  
  const isOperationCritical = useCallback((operationContext: string) => {
    return criticalOperations.has(operationContext);
  }, []);
  
  // Simulation des paramètres (non implémentés dans connectionModeService)
  const [settings, setSettings] = useState({
    autoSwitchOnFailure: true,
    maxConsecutiveFailures: 3,
    persistentModeStorage: true,
    showNotifications: true
  });
  
  const updateSettings = useCallback((newSettings: any) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Retourner une API compatible avec useOperationMode
  return {
    // États
    currentMode,
    isRealMode,
    isDemoMode,
    connectionHealth,
    
    // Compatibilité avec ancien système
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Actions - nouveau système
    toggleMode,
    enableDemoMode,
    enableRealMode,
    temporarilyForceReal,
    restoreMode,
    handleConnectionError,
    handleSuccessfulOperation,
    resetConnectionHealth,
    
    // Alias pour compatibilité
    toggle,
    reset,
    
    // Simulations d'opérations critiques
    markOperationAsCritical,
    unmarkOperationAsCritical,
    isOperationCritical,
    
    // Simulations de paramètres
    updateSettings,
    
    // Nouveaux alias pour compatibilité complète
    restorePreviousMode: restoreMode
  };
}
