
import { useState, useEffect } from 'react';

/**
 * Type pour l'état du mode opérationnel
 */
export interface OperationModeState {
  isDemoMode: boolean;
  reason?: string;
}

/**
 * Hook pour connaître le mode de fonctionnement de l'application
 */
export const useOperationMode = () => {
  const [state, setState] = useState<OperationModeState>({
    isDemoMode: true,
    reason: 'Mode de développement par défaut'
  });
  
  // Propriétés dérivées pour la compatibilité avec l'API existante
  const isDemoMode = state.isDemoMode;
  const isRealMode = !state.isDemoMode;
  const mode = isDemoMode ? 'demo' : 'real';
  
  useEffect(() => {
    // Vérifier si le mode réel est disponible
    // Pour l'instant, on est toujours en mode démo
    const checkMode = () => {
      setState({
        isDemoMode: true,
        reason: 'Mode de développement par défaut'
      });
    };
    
    checkMode();
  }, []);
  
  const enableDemoMode = (reason?: string) => {
    setState({
      isDemoMode: true,
      reason: reason || 'Activation manuelle du mode démonstration'
    });
  };
  
  const enableRealMode = () => {
    // Pour l'instant, cette fonction ne fait rien
    // car on est toujours en mode démo
    console.log('Tentative de passage en mode réel - Non implémenté');
    
    // On simule le passage en mode réel pour les tests
    setState({
      isDemoMode: false,
      reason: undefined
    });
  };
  
  return {
    isDemoMode,
    isRealMode,
    mode,
    state,
    enableDemoMode,
    enableRealMode
  };
};
