
// Define the operation mode options
export enum OperationMode {
  REAL = "real",
  DEMO = "demo"
}

// Define the settings for the operation mode
export interface OperationModeSettings {
  // Behavioral settings
  autoSwitchOnFailure: boolean;
  persistentModeStorage: boolean;
  showNotifications: boolean;
  useCacheInRealMode: boolean;
  
  // Simulation settings
  errorSimulationRate: number;
  simulatedNetworkDelay: number;
  
  // Security settings
  maxConsecutiveFailures: number;
}

// Define the state for the operation mode
export interface OperationModeState {
  mode: OperationMode;
  switchReason: string;
  failures: number;
  settings: OperationModeSettings;
  lastError?: Error;
}

// Define the hook return type
export interface OperationModeHook {
  // Current state properties
  mode: OperationMode;
  switchReason: string;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
  
  // Derived state properties
  isDemoMode: boolean;
  isRealMode: boolean;
  simulatedErrorRate: number;
  simulatedNetworkDelay: number;
  
  // Action methods
  toggle: () => void;
  setErrorRate: (rate: number) => void;
  setNetworkDelay: (delay: number) => void;
  enableDemoMode: (reason?: string) => void;
  enableRealMode: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  reset: () => void;
}

// Type for the operation mode service
export interface OperationModeService {
  // Current state getters
  getMode: () => OperationMode;
  getState: () => OperationModeState;
  getSettings: () => OperationModeSettings;
  getSwitchReason: () => string;
  getFailures: () => number;
  isDemoMode: () => boolean;
  isRealMode: () => boolean;
  
  // State modifiers
  setMode: (mode: OperationMode, reason?: string) => void;
  toggle: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  setErrorRate: (rate: number) => void;
  setNetworkDelay: (delay: number) => void;
  
  // Operational methods
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  reset: () => void;
  
  // Event handling
  onModeChange: (callback: (state: OperationModeState) => void) => () => void;
}
