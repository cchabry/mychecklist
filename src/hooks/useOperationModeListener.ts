
import { useEffect, useState } from 'react';
import { operationMode } from '@/services/operationMode';
import type { OperationMode } from '@/services/operationMode/types';

/**
 * Hook de compatibilité pour écouter les changements du mode opérationnel
 * Remplace l'ancien hook useMockMode avec une API plus moderne
 * @deprecated Utilisez useOperationMode() à la place
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

// Avertissement de dépréciation
console.warn(
  "[Deprecated] useOperationModeListener est un hook de compatibilité qui sera supprimé dans une future version. " +
  "Veuillez utiliser useOperationMode à la place."
);

// Alias pour compatibilité
export const useModeListener = useOperationModeListener;
