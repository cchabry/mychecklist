
import { ReactNode } from 'react';

export enum OperationMode {
  DEMO = 'demo',
  REAL = 'real'
}

export type SwitchReason = string;

export interface OperationModeSettings {
  // Paramètres comportementaux
  autoSwitchOnFailure: boolean;
  persistentModeStorage: boolean;
  showNotifications: boolean;
  
  // Paramètres de simulation
  errorSimulationRate: number; 
  simulatedNetworkDelay: number;
  
  // Paramètres de sécurité
  maxConsecutiveFailures: number;
}

export interface IOperationModeService {
  // Propriétés d'état
  readonly isDemoMode: boolean;
  readonly isRealMode: boolean;
  
  // Accesseurs d'état
  getMode(): OperationMode;
  getSwitchReason(): SwitchReason | null;
  getSettings(): OperationModeSettings;
  getConsecutiveFailures(): number;
  getLastError(): Error | null;
  
  // Gestion des abonnements
  subscribe(subscriber: OperationModeSubscriber): () => void;
  onModeChange(subscriber: (isDemoMode: boolean) => void): () => void;
  offModeChange(subscriber: (isDemoMode: boolean) => void): void;
  
  // Méthodes de changement de mode
  enableDemoMode(reason?: SwitchReason): void;
  enableRealMode(): void;
  toggle(): void;
  toggleMode(): void; // Alias pour toggle pour compatibilité
  setDemoMode(value: boolean): void; // Alias pour enableDemoMode/enableRealMode pour compatibilité
  
  // Gestion des erreurs
  handleConnectionError(error: Error, context?: string): void;
  handleSuccessfulOperation(): void;
  
  // Configuration
  updateSettings(partialSettings: Partial<OperationModeSettings>): void;
  
  // Réinitialisation
  reset(): void;
}

export type OperationModeSubscriber = (mode: OperationMode, reason: SwitchReason | null) => void;

export interface OperationModeUtils {
  applySimulatedDelay: () => Promise<void>;
  shouldSimulateError: () => boolean;
  simulateConnectionError: () => never;
  getScenario: (context: string) => any | null;
}

export interface OperationModeHook {
  // État
  mode: OperationMode;
  switchReason: SwitchReason | null;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
  
  // Propriétés calculées
  isDemoMode: boolean;
  isRealMode: boolean;
  simulatedErrorRate: number;
  simulatedNetworkDelay: number;
  
  // Actions
  enableDemoMode: (reason?: SwitchReason) => void;
  enableRealMode: () => void;
  toggle: () => void;
  setErrorRate: (rate: number) => void;
  setNetworkDelay: (delay: number) => void;
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  updateSettings: (partialSettings: Partial<OperationModeSettings>) => void;
  reset: () => void;
}
