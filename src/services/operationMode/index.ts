
import { create } from 'zustand';
import { toast } from 'sonner';

interface OperationModeState {
  // État
  isDemoMode: boolean;
  lastError: Error | null;
  lastErrorTimestamp: number | null;
  consecutiveErrors: number;
  
  // Actions
  enableDemoMode: (reason?: string) => void;
  enableRealMode: () => void;
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
}

const STORAGE_KEY = 'operation_mode';
const ERROR_THRESHOLD = 3; // Nombre d'erreurs consécutives avant le passage automatique en mode démo

// Charge l'état depuis localStorage
const loadInitialState = (): { isDemoMode: boolean } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur lors du chargement du mode d\'opération:', e);
  }
  
  // Par défaut, démarrer en mode démo pour éviter les erreurs CORS
  return { isDemoMode: true };
};

// Sauvegarde l'état dans localStorage
const saveState = (state: { isDemoMode: boolean }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du mode d\'opération:', e);
  }
};

// Zustand store pour le mode d'opération
export const useOperationMode = create<OperationModeState>((set, get) => ({
  // État initial
  ...loadInitialState(),
  lastError: null,
  lastErrorTimestamp: null,
  consecutiveErrors: 0,
  
  // Active le mode démo
  enableDemoMode: (reason?: string) => {
    const currentState = get();
    
    // Ne rien faire si déjà en mode démo
    if (currentState.isDemoMode) return;
    
    set({ isDemoMode: true });
    saveState({ isDemoMode: true });
    
    // Afficher un toast si une raison est fournie
    if (reason) {
      toast.info('Mode démonstration activé', {
        description: reason
      });
    }
    
    console.info('📱 Mode démonstration activé', reason ? `Raison: ${reason}` : '');
  },
  
  // Active le mode réel
  enableRealMode: () => {
    const currentState = get();
    
    // Ne rien faire si déjà en mode réel
    if (!currentState.isDemoMode) return;
    
    set({ 
      isDemoMode: false,
      consecutiveErrors: 0,
      lastError: null,
      lastErrorTimestamp: null
    });
    saveState({ isDemoMode: false });
    
    console.info('🔌 Mode réel activé');
  },
  
  // Gère une erreur de connexion
  handleConnectionError: (error: Error, context?: string) => {
    const currentState = get();
    const now = Date.now();
    
    // Si déjà en mode démo, juste mettre à jour l'erreur
    if (currentState.isDemoMode) {
      set({ 
        lastError: error,
        lastErrorTimestamp: now
      });
      return;
    }
    
    // Incrémenter le compteur d'erreurs consécutives
    const newConsecutiveErrors = currentState.consecutiveErrors + 1;
    
    // Mettre à jour l'état
    set({
      lastError: error,
      lastErrorTimestamp: now,
      consecutiveErrors: newConsecutiveErrors
    });
    
    console.error(
      `🛑 Erreur de connexion ${newConsecutiveErrors}/${ERROR_THRESHOLD}`,
      context ? `Contexte: ${context}` : '',
      error
    );
    
    // Si le seuil d'erreurs est atteint, passer en mode démo
    if (newConsecutiveErrors >= ERROR_THRESHOLD) {
      get().enableDemoMode('Trop d\'erreurs de connexion - passage en mode démonstration');
    }
  },
  
  // Réinitialise le compteur d'erreurs après une opération réussie
  handleSuccessfulOperation: () => {
    const currentState = get();
    
    // Ne rien faire si en mode démo ou s'il n'y a pas d'erreurs
    if (currentState.isDemoMode || currentState.consecutiveErrors === 0) {
      return;
    }
    
    set({ consecutiveErrors: 0 });
    console.info('✅ Opération réussie - compteur d\'erreurs réinitialisé');
  }
}));

// Exporter une instance singleton pour compatibilité avec le code existant
export const operationMode = {
  get isDemoMode() { return useOperationMode.getState().isDemoMode; },
  enableDemoMode: useOperationMode.getState().enableDemoMode,
  enableRealMode: useOperationMode.getState().enableRealMode,
  handleConnectionError: useOperationMode.getState().handleConnectionError,
  handleSuccessfulOperation: useOperationMode.getState().handleSuccessfulOperation
};
