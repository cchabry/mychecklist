
import { useEffect, useState } from 'react';
import { OperationMode, operationMode } from '@/services/operationMode';

/**
 * Hook de compatibilité pour écouter les changements du mode opérationnel
 * Remplace l'ancien hook useMockMode avec une API plus moderne
 */
export function useOperationModeListener() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<string | null>(operationMode.getSwitchReason());
  
  // Écouter les changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode, reason) => {
      setMode(newMode);
      setSwitchReason(reason);
    });
    
    // Nettoyage à la désinstallation du composant
    return unsubscribe;
  }, []);
  
  return {
    mode,
    switchReason,
    isDemoMode: mode === 'demo',
    isRealMode: mode === 'real',
    enableDemoMode: operationMode.enableDemoMode.bind(operationMode),
    enableRealMode: operationMode.enableRealMode.bind(operationMode),
    toggle: operationMode.toggle.bind(operationMode)
  };
}

// Alias pour compatibilité
export const useModeListener = useOperationModeListener;
