
import { DEFAULT_SETTINGS } from './constants';

export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo'
}

export type SwitchReason = string;

export type OperationModeSubscriber = (
  mode: OperationMode,
  reason?: SwitchReason | null
) => void;

// Définir les paramètres directement ici pour éviter les références circulaires
export interface OperationModeSettings {
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchOnFailure: boolean;
  
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: number;
  
  // Conserver le mode entre les sessions
  persistentModeStorage: boolean;
  
  // Afficher les notifications de changement de mode
  showNotifications: boolean;
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: boolean;
  
  // Taux d'erreurs simulées en mode démo (pourcentage)
  errorSimulationRate: number;
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: number;
}

export interface IOperationModeService {
  // Propriétés calculées
  readonly isDemoMode: boolean;
  readonly isRealMode: boolean;
  
  // Accesseurs d'état
  getMode(): OperationMode;
  getSwitchReason(): SwitchReason | null;
  getSettings(): OperationModeSettings;
  getConsecutiveFailures(): number;
  getLastError(): Error | null;

  // Gestion des opérations critiques
  markOperationAsCritical(operationContext: string): void;
  unmarkOperationAsCritical(operationContext: string): void;
  isOperationCritical(operationContext: string): boolean;
  
  // Gestion des abonnements
  subscribe(subscriber: OperationModeSubscriber): () => void;
  onModeChange(subscriber: (isDemoMode: boolean) => void): () => void;
  offModeChange(subscriber: (isDemoMode: boolean) => void): void;
  
  // Méthodes de changement de mode
  enableDemoMode(reason?: SwitchReason): void;
  enableRealMode(): void;
  toggle(): void;
  toggleMode(): void;
  setDemoMode(value: boolean): void;
  temporarilyForceReal(): void;
  
  // Gestion des erreurs
  handleConnectionError(error: Error, context?: string, isNonCritical?: boolean): void;
  handleSuccessfulOperation(): void;
  
  // Configuration
  updateSettings(partialSettings: Partial<OperationModeSettings>): void;
  
  // Réinitialisation
  reset(): void;
}

// Interface pour le hook useOperationMode
export interface OperationModeHook {
  mode: OperationMode;
  isDemoMode: boolean;
  isRealMode: boolean;
  switchReason: SwitchReason | null;
  failures: number;
  lastError: Error | null; // Ajout de la propriété lastError manquante
  settings: OperationModeSettings;
  enableDemoMode: (reason?: SwitchReason) => void;
  enableRealMode: () => void;
  toggle: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  reset: () => void;
  handleConnectionError: (error: Error, context?: string, isNonCritical?: boolean) => void;
  handleSuccessfulOperation: () => void;
  markOperationAsCritical: (operationContext: string) => void;
  unmarkOperationAsCritical: (operationContext: string) => void;
  isOperationCritical: (operationContext: string) => boolean;
  temporarilyForceReal: () => void;
}
