
import { useState, useEffect, useCallback } from 'react';
import { createGlobalState } from 'react-use';

export interface OperationModeState {
  isDemoMode: boolean;
  simulatedErrorRate: number;
  simulatedNetworkDelay: number;
}

const DEFAULT_STATE: OperationModeState = {
  isDemoMode: true,
  simulatedErrorRate: 20,
  simulatedNetworkDelay: 800
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
    this.saveState();
  }

  enableRealMode(): void {
    this._isDemoMode = false;
    this.saveState();
  }

  toggleMode(): void {
    this._isDemoMode = !this._isDemoMode;
    this.saveState();
  }

  // Gestion des erreurs
  handleConnectionError(error: Error, context: string = 'Opération'): void {
    console.warn(`[OperationMode] Erreur détectée (${context}): ${error.message}`);
  }

  handleSuccessfulOperation(): void {
    // Réinitialiser après une opération réussie
  }

  reset(): void {
    // Réinitialiser les paramètres
    this._errorRate = DEFAULT_STATE.simulatedErrorRate;
    this._networkDelay = DEFAULT_STATE.simulatedNetworkDelay;
  }

  private saveState(): void {
    try {
      localStorage.setItem('operationMode', JSON.stringify({
        isDemoMode: this._isDemoMode,
        simulatedErrorRate: this._errorRate,
        simulatedNetworkDelay: this._networkDelay
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
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du mode opérationnel:', error);
    }
  }
}

// Instance singleton du service
export const operationMode = new OperationModeService();

// Exportation de operationModeUtils pour compatibilité
export const operationModeUtils = {
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
export enum OperationMode {
  DEMO = 'demo',
  REAL = 'real'
}

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
        operationMode.enableDemoMode();
      } else {
        operationMode.enableRealMode();
      }
    }
  }, [state]);
  
  const toggle = useCallback(() => {
    operationMode.toggleMode();
    setState(prev => ({
      ...prev,
      isDemoMode: !prev.isDemoMode
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
      isDemoMode: true
    }));
  }, [setState]);
  
  const enableRealMode = useCallback(() => {
    operationMode.enableRealMode();
    setState(prev => ({
      ...prev,
      isDemoMode: false
    }));
  }, [setState]);

  const reset = useCallback(() => {
    operationMode.reset();
    setState(prev => ({
      ...prev,
      simulatedErrorRate: DEFAULT_STATE.simulatedErrorRate,
      simulatedNetworkDelay: DEFAULT_STATE.simulatedNetworkDelay
    }));
  }, [setState]);
  
  return {
    isDemoMode: state.isDemoMode,
    isRealMode: !state.isDemoMode,
    simulatedErrorRate: state.simulatedErrorRate,
    simulatedNetworkDelay: state.simulatedNetworkDelay,
    toggle,
    setErrorRate,
    setNetworkDelay,
    enableDemoMode,
    enableRealMode,
    reset,
    handleConnectionError: operationMode.handleConnectionError.bind(operationMode),
    handleSuccessfulOperation: operationMode.handleSuccessfulOperation.bind(operationMode)
  };
}
