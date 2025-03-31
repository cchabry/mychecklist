
/**
 * Service pour gérer le mode d'opération (démo ou réel)
 */

type OperationMode = 'demo' | 'real';
type OperationSource = 'user' | 'system' | 'auto';

interface OperationModeState {
  mode: OperationMode;
  reason: string;
  source: OperationSource;
  timestamp: number;
}

type SubscriberCallback = (state: OperationModeState) => void;

// Implémentation du service en mode 100% démo
const operationModeService = (() => {
  // État initial (toujours en mode démo)
  const defaultState: OperationModeState = {
    mode: 'demo',
    reason: 'Mode démonstration activé',
    source: 'system',
    timestamp: Date.now()
  };

  let state: OperationModeState = { ...defaultState };
  const subscribers = new Set<SubscriberCallback>();

  // Notifier tous les abonnés d'un changement d'état
  const notifySubscribers = () => {
    subscribers.forEach(callback => callback(state));
  };

  return {
    // Récupérer l'état actuel
    getState: (): OperationModeState => ({ ...state }),

    // Vérifier si on est en mode démo
    isDemoMode: (): boolean => state.mode === 'demo',

    // Vérifier si on est en mode réel
    isRealMode: (): boolean => state.mode === 'real',

    // Activer le mode démo (seule option supportée)
    enableDemoMode: (reason: string = 'Mode démonstration activé'): void => {
      state = {
        mode: 'demo',
        reason,
        source: 'user',
        timestamp: Date.now()
      };
      notifySubscribers();
    },

    // Tentative d'activer le mode réel (toujours échoue)
    enableRealMode: (): boolean => {
      // Ne pas autoriser le passage en mode réel
      return false;
    },

    // S'abonner aux changements d'état
    subscribe: (callback: SubscriberCallback): (() => void) => {
      subscribers.add(callback);
      // Appeler immédiatement avec l'état actuel
      callback(state);
      // Retourner une fonction pour se désabonner
      return () => {
        subscribers.delete(callback);
      };
    },

    // Réinitialiser à l'état par défaut
    reset: (): void => {
      state = {
        ...defaultState,
        source: 'system',
        timestamp: Date.now()
      };
      notifySubscribers();
    }
  };
})();

export { operationModeService };
export type { OperationModeState, OperationMode, OperationSource };
