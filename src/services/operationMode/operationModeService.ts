
import { OperationModeService, OperationModeState, OperationModeType } from '@/types/operation/operationMode';

/**
 * Service de gestion du mode opérationnel (réel vs démo)
 */
class OperationModeServiceImpl implements OperationModeService {
  private state: OperationModeState;
  private listeners: Array<(state: OperationModeState) => void> = [];
  private storageKey = 'operation_mode';
  
  constructor() {
    // Récupération du mode depuis le localStorage
    const savedState = this.getSavedState();
    
    this.state = savedState || {
      mode: 'real',
      timestamp: Date.now(),
      source: 'system'
    };
  }
  
  private getSavedState(): OperationModeState | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved) as OperationModeState;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du mode opérationnel :', error);
    }
    return null;
  }
  
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode opérationnel :', error);
    }
  }
  
  private updateState(newState: Partial<OperationModeState>): void {
    this.state = { ...this.state, ...newState, timestamp: Date.now() };
    this.saveState();
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  // Méthodes publiques
  getMode(): OperationModeType {
    return this.state.mode;
  }
  
  getState(): OperationModeState {
    return { ...this.state };
  }
  
  enableRealMode(reason?: string): void {
    if (this.state.mode === 'real') return;
    
    this.updateState({
      mode: 'real',
      reason,
      source: reason ? 'user' : 'system'
    });
  }
  
  enableDemoMode(reason?: string): void {
    if (this.state.mode === 'demo') return;
    
    this.updateState({
      mode: 'demo',
      reason,
      source: reason ? 'user' : 'system'
    });
  }
  
  reset(): void {
    this.updateState({
      mode: 'real',
      reason: 'Réinitialisation du mode',
      source: 'system'
    });
  }
  
  isDemoMode(): boolean {
    return this.state.mode === 'demo';
  }
  
  isRealMode(): boolean {
    return this.state.mode === 'real';
  }
  
  subscribe(listener: (state: OperationModeState) => void): () => void {
    this.listeners.push(listener);
    
    // Retourne une fonction de désinscription
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Créer une instance unique du service
export const operationModeService = new OperationModeServiceImpl();
