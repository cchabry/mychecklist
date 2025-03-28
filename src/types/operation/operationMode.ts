
/**
 * Types pour le système de mode opérationnel (réel vs démo)
 */

/**
 * Mode opérationnel de l'application
 * - real: Utilise l'API Notion réelle
 * - demo: Utilise des données simulées
 */
export type OperationMode = 'real' | 'demo';

/**
 * État du mode opérationnel
 */
export interface OperationModeState {
  /** Mode actuel (real ou demo) */
  mode: OperationMode;
  /** Raison du changement de mode (optionnel) */
  reason?: string;
  /** Timestamp du dernier changement */
  timestamp: string;
  /** Source du changement (utilisateur, système ou automatique) */
  source: 'user' | 'system' | 'auto' | 'default' | 'manual';
}

/**
 * Service de gestion du mode opérationnel
 * Responsable de maintenir et changer le mode opérationnel de l'application.
 * 
 * Le mode opérationnel détermine si l'application utilise :
 * - L'API Notion réelle (mode 'real')
 * - Des données simulées (mode 'demo')
 */
export interface OperationModeService {
  // État actuel
  getMode(): OperationMode;
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
 * 
 * Ce hook permet aux composants React d'accéder et de modifier
 * le mode opérationnel de l'application.
 * 
 * Exemples d'utilisation :
 * 
 * ```tsx
 * // Vérifier le mode actuel
 * const { isDemoMode } = useOperationMode();
 * if (isDemoMode) {
 *   // Afficher un message spécifique au mode démo
 * }
 * 
 * // Changer le mode
 * const { enableDemoMode } = useOperationMode();
 * enableDemoMode("Test de l'interface");
 * ```
 */
export interface UseOperationMode {
  // État
  mode: OperationMode;
  state: OperationModeState;
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Actions
  enableRealMode: (reason?: string) => void;
  enableDemoMode: (reason: string) => void;
  reset: () => void;
}
