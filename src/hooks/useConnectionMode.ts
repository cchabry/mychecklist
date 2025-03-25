
import { useState, useEffect, useCallback } from 'react';
import { connectionModeService } from '@/services/connection/connectionModeService';
import { ConnectionMode, ConnectionHealth, ModeChangeEvent } from '@/services/connection/types';

/**
 * Hook pour utiliser le service de mode de connexion
 * Remplace useOperationMode avec une interface simplifiée
 */
export function useConnectionMode() {
  const [currentMode, setCurrentMode] = useState<ConnectionMode>(connectionModeService.getMode());
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>(
    connectionModeService.getConnectionHealth()
  );
  
  // Mettre à jour le mode local lorsqu'il change dans le service
  useEffect(() => {
    const unsubscribe = connectionModeService.subscribe((event: ModeChangeEvent) => {
      setCurrentMode(event.currentMode);
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
  const reportConnectionError = useCallback((error: Error) => {
    connectionModeService.handleConnectionError(error);
    // Mettre à jour l'état de santé
    setConnectionHealth(connectionModeService.getConnectionHealth());
  }, []);
  
  // Fonction pour signaler une opération réussie
  const reportSuccessfulOperation = useCallback(() => {
    connectionModeService.handleSuccessfulOperation();
    // Mettre à jour l'état de santé
    setConnectionHealth(connectionModeService.getConnectionHealth());
  }, []);
  
  return {
    // États
    currentMode,
    isRealMode: connectionModeService.isRealMode,
    isDemoMode: connectionModeService.isDemoMode,
    connectionHealth,
    
    // Actions
    toggleMode,
    enableDemoMode,
    enableRealMode,
    temporarilyForceReal,
    restoreMode,
    reportConnectionError,
    reportSuccessfulOperation
  };
}
