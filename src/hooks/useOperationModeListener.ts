
import { useEffect, useState } from 'react';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour écouter les changements du mode opérationnel
 */
export function useOperationModeListener() {
  const [isDemoMode, setIsDemoMode] = useState(operationMode.isDemoMode);
  
  useEffect(() => {
    // Mettre à jour l'état quand le mode change
    const handleModeChange = (newMode: boolean) => {
      setIsDemoMode(newMode);
    };
    
    // S'abonner aux changements de mode
    operationMode.onModeChange(handleModeChange);
    
    // Initialiser avec la valeur actuelle
    setIsDemoMode(operationMode.isDemoMode);
    
    // Nettoyer l'abonnement
    return () => {
      operationMode.offModeChange(handleModeChange);
    };
  }, []);
  
  return {
    isDemoMode,
    toggleMode: operationMode.toggleMode,
    setDemoMode: operationMode.setDemoMode
  };
}
