
/**
 * Service gérant le mode d'opération (réel ou démo)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OperationMode = 'real' | 'demo' | 'auto';

interface OperationModeState {
  // État
  mode: OperationMode;
  lastModeChange: string | null;
  changeReason: string | null;
  
  // Propriétés calculées
  isDemoMode: boolean;
  isRealMode: boolean;
  isAutoMode: boolean;
  
  // Actions
  enableDemoMode: (reason?: string) => void;
  enableRealMode: (reason?: string) => void;
  enableAutoMode: (reason?: string) => void;
  toggleMode: () => void;
}

// Store Zustand avec persistance
export const useOperationModeStore = create<OperationModeState>()(
  persist(
    (set, get) => ({
      // État initial
      mode: 'auto',
      lastModeChange: null,
      changeReason: null,
      
      // Getters calculés
      get isDemoMode() {
        return get().mode === 'demo';
      },
      get isRealMode() {
        return get().mode === 'real';
      },
      get isAutoMode() {
        return get().mode === 'auto';
      },
      
      // Actions
      enableDemoMode: (reason = 'Manuel') => set({
        mode: 'demo',
        lastModeChange: new Date().toISOString(),
        changeReason: reason
      }),
      
      enableRealMode: (reason = 'Manuel') => set({
        mode: 'real',
        lastModeChange: new Date().toISOString(),
        changeReason: reason
      }),
      
      enableAutoMode: (reason = 'Manuel') => set({
        mode: 'auto',
        lastModeChange: new Date().toISOString(),
        changeReason: reason
      }),
      
      toggleMode: () => {
        const currentMode = get().mode;
        if (currentMode === 'demo') {
          get().enableRealMode('Toggle');
        } else {
          get().enableDemoMode('Toggle');
        }
      }
    }),
    {
      name: 'operation-mode', // Nom pour le stockage local
    }
  )
);

// Export d'un singleton pour un accès simplifié
export const operationMode = {
  get mode() {
    return useOperationModeStore.getState().mode;
  },
  get isDemoMode() {
    return useOperationModeStore.getState().isDemoMode;
  },
  get isRealMode() {
    return useOperationModeStore.getState().isRealMode;
  },
  get isAutoMode() {
    return useOperationModeStore.getState().isAutoMode;
  },
  enableDemoMode(reason?: string) {
    useOperationModeStore.getState().enableDemoMode(reason);
  },
  enableRealMode(reason?: string) {
    useOperationModeStore.getState().enableRealMode(reason);
  },
  enableAutoMode(reason?: string) {
    useOperationModeStore.getState().enableAutoMode(reason);
  },
  toggleMode() {
    useOperationModeStore.getState().toggleMode();
  }
};

export default operationMode;
