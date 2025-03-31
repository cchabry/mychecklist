
import { OperationModeService, OperationModeState, OperationModeType } from '@/types/operation/operationMode';

/**
 * Service de gestion du mode opérationnel (toujours en mode démo)
 */
class OperationModeServiceImpl implements OperationModeService {
  private state: OperationModeState;
  private listeners: Array<(state: OperationModeState) => void> = [];
  
  constructor() {
    // Toujours initialiser en mode démo
    this.state = {
      mode: 'demo',
      timestamp: Date.now(),
      source: 'system',
      reason: 'Mode de démonstration permanent'
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  // Méthodes publiques
  getMode(): OperationModeType {
    return 'demo'; // Toujours retourner 'demo'
  }
  
  getState(): OperationModeState {
    return { ...this.state };
  }
  
  enableRealMode(reason?: string): void {
    console.warn('Mode réel désactivé: l\'application fonctionne uniquement en mode démo');
    // Ne fait rien car on est toujours en mode démo
  }
  
  enableDemoMode(reason?: string): void {
    // Mettre à jour la raison si fournie
    if (reason && reason !== this.state.reason) {
      this.state = {
        ...this.state,
        reason,
        timestamp: Date.now(),
        source: 'user'
      };
      this.notifyListeners();
    }
  }
  
  reset(): void {
    // Réinitialiser mais rester en mode démo
    this.state = {
      mode: 'demo',
      reason: 'Mode de démonstration permanent',
      timestamp: Date.now(),
      source: 'system'
    };
    this.notifyListeners();
  }
  
  isDemoMode(): boolean {
    return true; // Toujours retourner true
  }
  
  isRealMode(): boolean {
    return false; // Toujours retourner false
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
