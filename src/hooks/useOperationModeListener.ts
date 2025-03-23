
import { useEffect, useState } from 'react';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour écouter les changements du mode opérationnel
 */
export function useOperationModeListener() {
  const [isDemoMode, setIsDemoMode] = useState(operationMode.isDemoMode);
  
  useEffect(() => {
    // Mettre à jour l'état quand le mode change
    const handleModeChange = (newIsDemoMode: boolean) => {
      setIsDemoMode(newIsDemoMode);
    };
    
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.onModeChange(handleModeChange);
    
    // Initialiser avec la valeur actuelle
    setIsDemoMode(operationMode.isDemoMode);
    
    // Nettoyer l'abonnement
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    isDemoMode,
    toggleMode: operationMode.toggleMode.bind(operationMode),
    setDemoMode: operationMode.setDemoMode.bind(operationMode)
  };
}
