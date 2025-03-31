
import { OperationModeState, OperationModeType } from '@/types/operation/operationMode';

/**
 * Service simple pour gérer le mode opérationnel (toujours en mode démo)
 */
class OperationModeService {
  private subscribers: ((state: OperationModeState) => void)[] = [];
  private state: OperationModeState = {
    mode: 'demo',
    reason: 'Mode de démonstration permanent'
  };
  
  /**
   * Obtenir l'état actuel du mode opérationnel
   */
  public getState(): OperationModeState {
    return { ...this.state };
  }
  
  /**
   * Vérifier si l'application est en mode démo (toujours true)
   */
  public isDemoMode(): boolean {
    return true;
  }
  
  /**
   * Vérifier si l'application est en mode réel (toujours false)
   */
  public isRealMode(): boolean {
    return false;
  }
  
  /**
   * Activer le mode démo avec une raison spécifique
   */
  public enableDemoMode(customReason?: string): void {
    // Mettre à jour la raison uniquement si elle est fournie
    if (customReason) {
      this.state.reason = customReason;
      this.notifySubscribers();
    }
  }
  
  /**
   * Tenter d'activer le mode réel (ne fait rien, car toujours en démo)
   * @returns false car le mode réel n'est pas disponible
   */
  public enableRealMode(): boolean {
    // Ne fait rien car nous sommes toujours en mode démo
    console.warn('Mode réel désactivé: l\'application fonctionne uniquement en mode démo');
    return false;
  }
  
  /**
   * Réinitialiser l'état (revient au mode démo par défaut)
   */
  public reset(): void {
    this.state = {
      mode: 'demo',
      reason: 'Mode de démonstration permanent'
    };
    this.notifySubscribers();
  }
  
  /**
   * S'abonner aux changements d'état
   */
  public subscribe(callback: (state: OperationModeState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notifier tous les abonnés du changement d'état
   */
  private notifySubscribers(): void {
    const state = this.getState();
    for (const subscriber of this.subscribers) {
      subscriber(state);
    }
  }
}

// Créer et exporter une instance singleton
export const operationModeService = new OperationModeService();
