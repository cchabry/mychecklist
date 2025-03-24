
import { DEFAULT_SETTINGS } from './constants';

export type OperationMode = 'real' | 'mock';

export enum SwitchReason {
  ERROR = 'error',
  USER = 'user',
  SYSTEM = 'system',
  TIMEOUT = 'timeout',
  INIT = 'init'
}

export interface OperationModeSettings {
  // Paramètres comportementaux
  autoSwitchOnFailure: boolean;
  persistentModeStorage: boolean;
  showNotifications: boolean;
  useCacheInRealMode: boolean;
  
  // Paramètres de simulation
  errorSimulationRate: number;
  simulatedNetworkDelay: number;
  
  // Paramètres de sécurité
  maxConsecutiveFailures: number;
}

export interface OperationModeState {
  mode: OperationMode;
  switchReason: SwitchReason | null;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
}

export interface OperationModeHook extends OperationModeState {
  isDemoMode: boolean;
  isRealMode: boolean;
  switchMode: (mode: OperationMode, reason?: SwitchReason) => void;
  toggleMode: (reason?: SwitchReason) => void;
  resetFailures: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  reset: () => void;
  simulatedErrorRate: number;
  simulatedNetworkDelay: number;
  setErrorRate: (rate: number) => void;
  setNetworkDelay: (delay: number) => void;
}

export interface OperationModeSubscriber {
  onModeChange?: (mode: OperationMode) => void;
  onFailure?: (error: Error) => void;
  onReset?: () => void;
}

export interface IOperationModeService {
  getMode(): OperationMode;
  switchMode(mode: OperationMode, reason?: SwitchReason): void;
  toggleMode(reason?: SwitchReason): void;
  registerFailure(error: Error): void;
  resetFailures(): void;
  updateSettings(settings: Partial<OperationModeSettings>): void;
  getSettings(): OperationModeSettings;
  getState(): OperationModeState;
  subscribe(subscriber: OperationModeSubscriber): () => void;
  reset(): void;
}

export const OperationModeUtils = {
  getDefaultSettings: (): OperationModeSettings => {
    return { ...DEFAULT_SETTINGS };
  }
};
