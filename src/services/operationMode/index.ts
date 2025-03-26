
/**
 * Service de gestion du mode opérationnel
 * Implémentation de base qui sera étendue plus tard
 */

import { 
  OperationModeType, 
  OperationModeState, 
  OperationModeService 
} from '@/types/operationMode';

// Implémentation basique du service
const createOperationModeService = (): OperationModeService => {
  // État initial
  let currentState: OperationModeState = {
    mode: 'real',
    timestamp: Date.now(),
    source: 'system'
  };
  
  // Liste des écouteurs
  const listeners: ((state: OperationModeState) => void)[] = [];
  
  // Notifier tous les écouteurs
  const notify = () => {
    listeners.forEach(listener => listener(currentState));
  };
  
  // Changer l'état
  const setState = (newState: Partial<OperationModeState>) => {
    currentState = {
      ...currentState,
      ...newState,
      timestamp: Date.now()
    };
    notify();
  };
  
  return {
    // Getters
    getMode: () => currentState.mode,
    getState: () => ({ ...currentState }),
    
    // Actions
    enableRealMode: (reason) => {
      setState({
        mode: 'real',
        reason,
        source: 'user'
      });
    },
    
    enableDemoMode: (reason) => {
      setState({
        mode: 'demo',
        reason,
        source: 'user'
      });
    },
    
    reset: () => {
      setState({
        mode: 'real',
        reason: 'reset',
        source: 'user'
      });
    },
    
    // Helpers
    isDemoMode: () => currentState.mode === 'demo',
    isRealMode: () => currentState.mode === 'real',
    
    // Écouteurs
    subscribe: (listener) => {
      listeners.push(listener);
      
      // Retourner une fonction pour se désabonner
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  };
};

// Exportation de l'instance unique du service
export const operationMode = createOperationModeService();
