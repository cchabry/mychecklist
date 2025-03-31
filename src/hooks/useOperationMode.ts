
import { useState, useEffect } from 'react';

/**
 * Hook pour connaître le mode de fonctionnement de l'application
 */
export const useOperationMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  useEffect(() => {
    // Vérifier si le mode réel est disponible
    // Pour l'instant, on est toujours en mode démo
    const checkMode = () => {
      setIsDemoMode(true);
    };
    
    checkMode();
  }, []);
  
  const enableDemoMode = () => {
    setIsDemoMode(true);
  };
  
  const enableRealMode = () => {
    // Pour l'instant, cette fonction ne fait rien
    // car on est toujours en mode démo
    console.log('Tentative de passage en mode réel - Non implémenté');
  };
  
  return {
    isDemoMode,
    enableDemoMode,
    enableRealMode
  };
};
