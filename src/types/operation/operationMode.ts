
/**
 * Types pour le système de mode opérationnel (réel vs démo)
 */

export type OperationModeType = 'real' | 'demo';

/**
 * État du mode opérationnel
 */
export interface OperationModeState {
  mode: OperationModeType;
  reason?: string;
  timestamp: number;
  source: 'user' | 'system' | 'auto';
}

/**
 * Service de gestion du mode opérationnel
 */
export interface OperationModeService {
  // État actuel
  getMode(): OperationModeType;
  getState(): OperationModeState;
  
  // Actions
  enableRealMode(reason?: string): void;
  enableDemoMode(reason?: string): void;
  reset(): void;
  
  // Helpers
  isDemoMode(): boolean;
  isRealMode(): boolean;
  
  // Écouteurs
  subscribe(listener: (state: OperationModeState) => void): () => void;
}

/**
 * Hook pour utiliser le mode opérationnel
 */
export interface UseOperationMode {
  // État
  mode: OperationModeType;
  state: OperationModeState;
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Actions
  enableRealMode: (reason?: string) => void;
  enableDemoMode: (reason?: string) => void;
  reset: () => void;
}
