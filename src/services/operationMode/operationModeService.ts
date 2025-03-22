
/**
 * Service principal pour gérer le mode opérationnel
 */
import { 
  OperationMode, 
  OperationModeSettings, 
  OperationModeState,
  defaultSettings
} from './types';

// État interne
let _state: OperationModeState = {
  mode: OperationMode.REAL,
  switchReason: null,
  consecutiveFailures: 0,
  lastError: null,
  failures: 0 // Pour la compatibilité avec le code existant
};

// Paramètres
let _settings: OperationModeSettings = { ...defaultSettings };

// Abonnés aux changements d'état
let _subscribers: Array<(mode: OperationMode) => void> = [];

// Notification des abonnés
const notifySubscribers = (): void => {
  _subscribers.forEach(callback => callback(_state.mode));
};

// Service public
export const operationModeService = {
  // Getters pour l'état
  get mode(): OperationMode {
    return _state.mode;
  },
  
  get isDemoMode(): boolean {
    return _state.mode === OperationMode.DEMO;
  },
  
  get isRealMode(): boolean {
    return _state.mode === OperationMode.REAL;
  },
  
  get isTransitioning(): boolean {
    return _state.mode === OperationMode.TRANSITIONING;
  },
  
  get switchReason(): string | null {
    return _state.switchReason;
  },
  
  get lastError(): Error | null {
    return _state.lastError;
  },
  
  get failures(): number {
    return _state.failures;
  },
  
  // Méthodes pour modifier l'état
  enableDemoMode: (reason: string = 'Activation manuelle'): void => {
    if (_state.mode !== OperationMode.DEMO) {
      _state = {
        ..._state,
        mode: OperationMode.DEMO,
        switchReason: reason
      };
      
      try {
        localStorage.setItem('operation_mode', OperationMode.DEMO);
      } catch (e) {
        console.warn('Impossible de sauvegarder le mode dans localStorage', e);
      }
      
      notifySubscribers();
    }
  },
  
  enableRealMode: (): void => {
    if (_state.mode !== OperationMode.REAL) {
      _state = {
        ..._state,
        mode: OperationMode.REAL,
        switchReason: 'Activation manuelle du mode réel',
        consecutiveFailures: 0,
        failures: 0
      };
      
      try {
        localStorage.setItem('operation_mode', OperationMode.REAL);
      } catch (e) {
        console.warn('Impossible de sauvegarder le mode dans localStorage', e);
      }
      
      notifySubscribers();
    }
  },
  
  toggle: (): OperationMode => {
    if (_state.mode === OperationMode.DEMO) {
      operationModeService.enableRealMode();
    } else {
      operationModeService.enableDemoMode('Basculement manuel');
    }
    return _state.mode;
  },
  
  handleConnectionError: (error: Error, context: string = 'Opération réseau'): void => {
    // Incrémenter le compteur d'échecs
    _state.consecutiveFailures += 1;
    _state.failures += 1;
    _state.lastError = error;
    
    console.warn(`Erreur de connexion (${_state.consecutiveFailures}): ${error.message}`, { context, error });
    
    // Si le basculement automatique est activé et qu'on a atteint le seuil d'échecs
    if (_settings.autoSwitch && _state.mode === OperationMode.REAL && _state.consecutiveFailures >= 2) {
      const reason = `Échec de connexion répété (${_state.consecutiveFailures}x): ${error.message}`;
      operationModeService.enableDemoMode(reason);
    }
    
    notifySubscribers();
  },
  
  handleSuccessfulOperation: (): void => {
    // Réinitialiser le compteur d'échecs consécutifs
    if (_state.consecutiveFailures > 0) {
      _state.consecutiveFailures = 0;
      notifySubscribers();
    }
  },
  
  // Gestion des paramètres
  get settings(): OperationModeSettings {
    return { ..._settings };
  },
  
  updateSettings: (newSettings: Partial<OperationModeSettings>): void => {
    _settings = { ..._settings, ...newSettings };
    
    // Compatibilité: autoSwitch et autoFallbackEnabled sont liés
    if ('autoSwitch' in newSettings) {
      _settings.autoFallbackEnabled = newSettings.autoSwitch;
    } else if ('autoFallbackEnabled' in newSettings) {
      _settings.autoSwitch = newSettings.autoFallbackEnabled;
    }
    
    try {
      localStorage.setItem('operation_mode_settings', JSON.stringify(_settings));
    } catch (e) {
      console.warn('Impossible de sauvegarder les paramètres dans localStorage', e);
    }
    
    notifySubscribers();
  },
  
  // Abonnement aux changements
  subscribe: (callback: (mode: OperationMode) => void): (() => void) => {
    _subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      _subscribers = _subscribers.filter(cb => cb !== callback);
    };
  }
};

// Initialisation au démarrage
try {
  // Charger les paramètres
  const savedSettings = localStorage.getItem('operation_mode_settings');
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings);
    _settings = { ...defaultSettings, ...parsedSettings };
  }
  
  // Charger le mode
  if (_settings.persistMode) {
    const savedMode = localStorage.getItem('operation_mode');
    if (savedMode === OperationMode.DEMO) {
      _state.mode = OperationMode.DEMO;
      _state.switchReason = 'Mode restauré depuis la session précédente';
    }
  }
} catch (e) {
  console.warn('Erreur lors de l\'initialisation du mode opérationnel', e);
}
