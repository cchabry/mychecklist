
import { useEffect, useState } from 'react';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour écouter les changements de mode opérationnel (démo/réel)
 * @returns {boolean} Indique si le mode démo est actif
 */
export const useOperationModeListener = () => {
  // Définir un état pour suivre si le mode démo est actif
  const [demoModeActive, setDemoModeActive] = useState(operationMode.isDemoMode);
  
  // Mettre à jour l'état du mode démo lors des changements
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode) => {
      setDemoModeActive(operationMode.isDemoMode);
    });
    
    // Nettoyer l'abonnement au démontage
    return unsubscribe;
  }, []);
  
  return { 
    isDemoMode: demoModeActive,
    enableRealMode: operationMode.enableRealMode,
    enableDemoMode: operationMode.enableDemoMode
  };
};
