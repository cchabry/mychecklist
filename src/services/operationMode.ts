
import { useState, useEffect, useCallback } from 'react';
import { 
  OperationMode, 
  OperationModeSettings,
  SwitchReason, 
  OperationModeUtils
} from './operationMode/types';
import { DEFAULT_SETTINGS } from './operationMode/constants';

export interface OperationModeState {
  isDemoMode: boolean;
  simulatedErrorRate: number;
  simulatedNetworkDelay: number;
  switchReason: SwitchReason | null;
  failures: number;
  settings: OperationModeSettings;
  mode: OperationMode;
}

const createGlobalState = <T>(initialState: T | (() => T)) => {
  let state = typeof initialState === 'function' 
    ? (initialState as () => T)() 
    : initialState;
  const listeners = new Set<(state: T) => void>();

  return () => {
    const [localState, setLocalState] = useState<T>(state);

    useEffect(() => {
      listeners.add(setLocalState);
      return () => {
        listeners.delete(setLocalState);
      };
    }, []);

    const setState = (newState: T | ((prevState: T) => T)) => {
      state = typeof newState === 'function'
        ? (newState as (prevState: T) => T)(state)
        : newState;
      
      listeners.forEach(listener => listener(state));
      return state;
    };

    return [localState, setState] as const;
  };
};

const DEFAULT_STATE: OperationModeState = {
  isDemoMode: true,
  simulatedErrorRate: DEFAULT_SETTINGS.errorSimulationRate,
  simulatedNetworkDelay: DEFAULT_SETTINGS.simulatedNetworkDelay,
  switchReason: null,
  failures: 0,
  settings: DEFAULT_SETTINGS,
  mode: OperationMode.DEMO
};

// Créez un état global pour le mode de fonctionnement
const useGlobalOperationMode = createGlobalState<OperationModeState>(
  // Tenter de charger l'état depuis localStorage
  () => {
    try {
      const savedState = localStorage.getItem('operationMode');
      return savedState ? JSON.parse(savedState) : DEFAULT_STATE;
    } catch (error) {
      console.error('Erreur lors du chargement du mode opérationnel:', error);
      return DEFAULT_STATE;
    }
  }
);

class OperationModeService {
  // Propriétés pour les paramètres simulés
  private _errorRate: number = DEFAULT_STATE.simulatedErrorRate;
  private _networkDelay: number = DEFAULT_STATE.simulatedNetworkDelay;
  private _isDemoMode: boolean = DEFAULT_STATE.isDemoMode;
  private _switchReason: SwitchReason | null = null;
  private _failures: number = 0;
  private _lastError: Error | null = null;
  private _settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private _subscribers: ((isDemoMode: boolean) => void)[] = [];

  // Getters et setters
  get simulatedErrorRate(): number {
    return this._errorRate;
  }

  get simulatedNetworkDelay(): number {
    return this._networkDelay;
  }

  get isDemoMode(): boolean {
    return this._isDemoMode;
  }

  get isRealMode(): boolean {
    return !this._isDemoMode;
  }

  get switchReason(): SwitchReason | null {
    return this._switchReason;
  }

  get failures(): number {
    return this._failures;
  }

  get lastError(): Error | null {
    return this._lastError;
  }

  get settings(): OperationModeSettings {
    return { ...this._settings };
  }

  get mode(): OperationMode {
    return this._isDemoMode ? OperationMode.DEMO : OperationMode.REAL;
  }

  getMode(): OperationMode {
    return this.mode;
  }

  getSwitchReason(): SwitchReason | null {
    return this._switchReason;
  }

  getSettings(): OperationModeSettings {
    return { ...this._settings };
  }

  getConsecutiveFailures(): number {
    return this._failures;
  }

  getLastError(): Error | null {
    return this._lastError;
  }

  setSimulatedErrorRate(rate: number): void {
    if (rate >= 0 && rate <= 100) {
      this._errorRate = rate;
      this.saveState();
    }
  }

  setSimulatedNetworkDelay(delay: number): void {
    if (delay >= 0) {
      this._networkDelay = delay;
      this.saveState();
    }
  }

  enableDemoMode(reason: string = 'Changement manuel'): void {
    this._isDemoMode = true;
    this._switchReason = reason;
    this.saveState();
    this._notifySubscribers();
  }

  enableRealMode(): void {
    this._isDemoMode = false;
    this._switchReason = null;
    this.saveState();
    this._notifySubscribers();
  }

  toggle(): void {
    if (this._isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode('Basculement manuel');
    }
  }

  toggleMode(): void {
    this.toggle();
  }

  setDemoMode(value: boolean): void {
    if (value) {
      this.enableDemoMode();
    } else {
      this.enableRealMode();
    }
  }

  // Gestion des erreurs
  handleConnectionError(error: Error, context: string = 'Opération'): void {
    this._lastError = error;
    this._failures++;
    
    console.warn(`[OperationMode] Erreur détectée (${context}): ${error.message}`);
    
    // Vérifier s'il faut basculer automatiquement en mode démo
    if (
      this._settings.autoSwitchOnFailure && 
      !this._isDemoMode &&
      this._failures >= this._settings.maxConsecutiveFailures
    ) {
      this.enableDemoMode(`Basculement automatique après ${this._failures} échecs`);
    }
  }

  handleSuccessfulOperation(): void {
    // Réinitialiser après une opération réussie
    if (this._failures > 0) {
      this._failures = 0;
      this._lastError = null;
    }
  }

  updateSettings(partialSettings: Partial<OperationModeSettings>): void {
    this._settings = {
      ...this._settings,
      ...partialSettings
    };
    this.saveState();
  }

  reset(): void {
    // Réinitialiser les paramètres
    this._errorRate = DEFAULT_SETTINGS.errorSimulationRate;
    this._networkDelay = DEFAULT_SETTINGS.simulatedNetworkDelay;
    this._failures = 0;
    this._lastError = null;
    this._settings = { ...DEFAULT_SETTINGS };
  }

  subscribe(subscriber: (isDemoMode: boolean) => void): () => void {
    this._subscribers.push(subscriber);
    return () => {
      this._subscribers = this._subscribers.filter(s => s !== subscriber);
    };
  }

  onModeChange(subscriber: (isDemoMode: boolean) => void): () => void {
    return this.subscribe(subscriber);
  }

  offModeChange(subscriber: (isDemoMode: boolean) => void): void {
    this._subscribers = this._subscribers.filter(s => s !== subscriber);
  }

  private _notifySubscribers(): void {
    for (const subscriber of this._subscribers) {
      subscriber(this._isDemoMode);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('operationMode', JSON.stringify({
        isDemoMode: this._isDemoMode,
        simulatedErrorRate: this._errorRate,
        simulatedNetworkDelay: this._networkDelay,
        switchReason: this._switchReason,
        failures: this._failures,
        settings: this._settings,
        mode: this.mode
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode opérationnel:', error);
    }
  }

  // Méthode pour simuler un délai réseau
  async simulateNetworkDelay(): Promise<void> {
    if (this._isDemoMode && this._networkDelay > 0) {
      return new Promise(resolve => setTimeout(resolve, this._networkDelay));
    }
  }

  // Méthode pour simuler une erreur
  shouldSimulateError(): boolean {
    if (this._isDemoMode && this._errorRate > 0) {
      return Math.random() * 100 < this._errorRate;
    }
    return false;
  }

  // Initialiser l'état depuis localStorage si nécessaire
  initFromStorage(): void {
    try {
      const savedState = localStorage.getItem('operationMode');
      if (savedState) {
        const state = JSON.parse(savedState);
        this._isDemoMode = state.isDemoMode;
        this._errorRate = state.simulatedErrorRate;
        this._networkDelay = state.simulatedNetworkDelay;
        this._switchReason = state.switchReason || null;
        this._failures = state.failures || 0;
        this._settings = state.settings || { ...DEFAULT_SETTINGS };
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du mode opérationnel:', error);
    }
  }
}

// Instance singleton du service
export const operationMode = new OperationModeService();

// Exportation de operationModeUtils pour compatibilité
export const operationModeUtils: OperationModeUtils = {
  applySimulatedDelay: async (): Promise<void> => {
    await operationMode.simulateNetworkDelay();
  },
  
  shouldSimulateError: (): boolean => {
    return operationMode.shouldSimulateError();
  },
  
  simulateConnectionError(): never {
    throw new Error("Erreur de connexion simulée");
  },
  
  getScenario(context: string): any | null {
    // Cette méthode pourra être enrichie
    return null;
  }
};

// Exportation de l'énumération OperationMode
export { OperationMode } from './operationMode/types';

// Hook pour utiliser le mode opérationnel dans les composants
export function useOperationMode() {
  const [state, setState] = useGlobalOperationMode();
  
  // Initialiser le service avec l'état stocké
  useEffect(() => {
    operationMode.initFromStorage();
  }, []);
  
  // Synchroniser l'état du service avec l'état global
  useEffect(() => {
    operationMode.setSimulatedErrorRate(state.simulatedErrorRate);
    operationMode.setSimulatedNetworkDelay(state.simulatedNetworkDelay);
    if (state.isDemoMode !== operationMode.isDemoMode) {
      if (state.isDemoMode) {
        operationMode.enableDemoMode(state.switchReason || undefined);
      } else {
        operationMode.enableRealMode();
      }
    }
  }, [state]);
  
  const toggle = useCallback(() => {
    operationMode.toggle();
    setState(prev => ({
      ...prev,
      isDemoMode: !prev.isDemoMode,
      mode: !prev.isDemoMode ? OperationMode.DEMO : OperationMode.REAL,
      switchReason: !prev.isDemoMode ? 'Basculement manuel' : null
    }));
  }, [setState]);
  
  const setErrorRate = useCallback((rate: number) => {
    operationMode.setSimulatedErrorRate(rate);
    setState(prev => ({
      ...prev,
      simulatedErrorRate: rate
    }));
  }, [setState]);
  
  const setNetworkDelay = useCallback((delay: number) => {
    operationMode.setSimulatedNetworkDelay(delay);
    setState(prev => ({
      ...prev,
      simulatedNetworkDelay: delay
    }));
  }, [setState]);
  
  const enableDemoMode = useCallback((reason: string = 'Changement manuel') => {
    operationMode.enableDemoMode(reason);
    setState(prev => ({
      ...prev,
      isDemoMode: true,
      mode: OperationMode.DEMO,
      switchReason: reason
    }));
  }, [setState]);
  
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
    setState(prev => ({
      ...prev,
      isDemoMode: false,
      mode: OperationMode.REAL,
      switchReason: null
    }));
  }, [setState]);

  const updateSettings = useCallback((partialSettings: Partial<OperationModeSettings>) => {
    operationMode.updateSettings(partialSettings);
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partialSettings
      }
    }));
  }, [setState]);

  const reset = useCallback(() => {
    operationMode.reset();
    setState(prev => ({
      ...prev,
      simulatedErrorRate: DEFAULT_SETTINGS.errorSimulationRate,
      simulatedNetworkDelay: DEFAULT_SETTINGS.simulatedNetworkDelay,
      failures: 0,
      lastError: null,
      settings: { ...DEFAULT_SETTINGS }
    }));
  }, [setState]);
  
  return {
    // État
    mode: state.mode || (state.isDemoMode ? OperationMode.DEMO : OperationMode.REAL),
    switchReason: state.switchReason || operationMode.switchReason,
    failures: state.failures || operationMode.failures,
    lastError: state.lastError || operationMode.lastError,
    settings: state.settings || operationMode.settings,
    
    // Propriétés calculées
    isDemoMode: state.isDemoMode,
    isRealMode: !state.isDemoMode,
    simulatedErrorRate: state.simulatedErrorRate,
    simulatedNetworkDelay: state.simulatedNetworkDelay,
    
    // Actions
    toggle,
    setErrorRate,
    setNetworkDelay,
    enableDemoMode,
    enableRealMode,
    updateSettings,
    reset,
    handleConnectionError: operationMode.handleConnectionError.bind(operationMode),
    handleSuccessfulOperation: operationMode.handleSuccessfulOperation.bind(operationMode)
  };
}
