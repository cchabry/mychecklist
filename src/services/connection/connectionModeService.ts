
import { ConnectionMode, ConnectionHealth, ConnectionModeOptions, ModeChangeEvent, ModeChangeSubscriber } from './types';

/**
 * Service simplifié pour gérer le mode de connexion à l'API
 * Remplace operationMode avec une approche plus directe et moins complexe
 */
class ConnectionModeService {
  private currentMode: ConnectionMode;
  private subscribers: ModeChangeSubscriber[] = [];
  private options: ConnectionModeOptions;
  private previousMode: ConnectionMode | null = null;
  private temporaryMode: boolean = false;
  private connectionHealth: ConnectionHealth;
  
  constructor(options: ConnectionModeOptions = {}) {
    this.options = {
      persistMode: true,
      storageKey: 'connection_mode',
      healthThreshold: 3,
      ...options
    };
    
    // Initialiser l'état de santé
    this.connectionHealth = {
      lastError: null,
      lastSuccess: null,
      consecutiveErrors: 0,
      healthyConnection: true
    };
    
    // Charger le mode depuis le stockage local si disponible
    if (this.options.persistMode && typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(this.options.storageKey || 'connection_mode');
      this.currentMode = (savedMode === ConnectionMode.REAL) 
        ? ConnectionMode.REAL 
        : ConnectionMode.DEMO;
    } else {
      this.currentMode = ConnectionMode.DEMO;
    }
  }
  
  /**
   * Obtenir le mode actuel
   */
  getMode(): ConnectionMode {
    return this.currentMode;
  }
  
  /**
   * Vérifier si le mode actuel est le mode démo
   */
  get isDemoMode(): boolean {
    return this.currentMode === ConnectionMode.DEMO;
  }
  
  /**
   * Vérifier si le mode actuel est le mode réel
   */
  get isRealMode(): boolean {
    return this.currentMode === ConnectionMode.REAL;
  }
  
  /**
   * Obtenir l'état de santé de la connexion
   */
  getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }
  
  /**
   * Activer le mode démo
   */
  enableDemoMode(reason: string = 'Changement manuel'): void {
    if (this.currentMode === ConnectionMode.DEMO) return;
    
    const previousMode = this.currentMode;
    this.currentMode = ConnectionMode.DEMO;
    
    if (this.options.persistMode && typeof window !== 'undefined') {
      localStorage.setItem(this.options.storageKey || 'connection_mode', ConnectionMode.DEMO);
    }
    
    this.notifySubscribers({
      previousMode,
      currentMode: this.currentMode,
      reason
    });
  }
  
  /**
   * Activer le mode réel
   */
  enableRealMode(): void {
    if (this.currentMode === ConnectionMode.REAL) return;
    
    const previousMode = this.currentMode;
    this.currentMode = ConnectionMode.REAL;
    
    if (this.options.persistMode && typeof window !== 'undefined') {
      localStorage.setItem(this.options.storageKey || 'connection_mode', ConnectionMode.REAL);
    }
    
    this.notifySubscribers({
      previousMode,
      currentMode: this.currentMode,
      reason: 'Changement manuel'
    });
    
    // Réinitialiser le compteur d'erreurs
    this.connectionHealth.consecutiveErrors = 0;
    this.connectionHealth.healthyConnection = true;
  }
  
  /**
   * Basculer entre les modes
   */
  toggleMode(): void {
    if (this.currentMode === ConnectionMode.DEMO) {
      this.enableRealMode();
    } else {
      this.enableDemoMode('Changement manuel (bascule)');
    }
  }
  
  /**
   * Forcer temporairement le mode réel
   * Utile pour les opérations qui nécessitent un accès API réel une seule fois
   */
  temporarilyForceReal(): void {
    if (this.currentMode === ConnectionMode.REAL) return;
    
    this.previousMode = this.currentMode;
    this.temporaryMode = true;
    this.currentMode = ConnectionMode.REAL;
    
    // Ne pas persister ce changement temporaire
    
    this.notifySubscribers({
      previousMode: this.previousMode,
      currentMode: this.currentMode,
      reason: 'Forcé temporairement'
    });
  }
  
  /**
   * Restaurer le mode précédent après un forçage temporaire
   */
  restoreMode(): void {
    if (!this.temporaryMode || !this.previousMode) return;
    
    const currentMode = this.currentMode;
    this.currentMode = this.previousMode;
    this.previousMode = null;
    this.temporaryMode = false;
    
    this.notifySubscribers({
      previousMode: currentMode,
      currentMode: this.currentMode,
      reason: 'Restauré après forçage temporaire'
    });
  }
  
  /**
   * Gérer une erreur de connexion
   */
  handleConnectionError(error: Error): void {
    // Mettre à jour l'état de santé
    this.connectionHealth.lastError = error;
    this.connectionHealth.consecutiveErrors++;
    
    // Vérifier si la connexion est toujours saine
    if (this.connectionHealth.consecutiveErrors >= (this.options.healthThreshold || 3)) {
      this.connectionHealth.healthyConnection = false;
      
      // Si en mode réel et que la connexion n'est pas saine, basculer en mode démo
      if (this.currentMode === ConnectionMode.REAL && !this.temporaryMode) {
        this.enableDemoMode(`Trop d'erreurs consécutives (${this.connectionHealth.consecutiveErrors})`);
      }
    }
  }
  
  /**
   * Signaler une opération réussie
   */
  handleSuccessfulOperation(): void {
    // Mettre à jour l'état de santé
    this.connectionHealth.lastSuccess = new Date();
    this.connectionHealth.consecutiveErrors = 0;
    this.connectionHealth.healthyConnection = true;
  }
  
  /**
   * S'abonner aux changements de mode
   */
  subscribe(callback: ModeChangeSubscriber): () => void {
    this.subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    };
  }
  
  /**
   * Notifier tous les abonnés d'un changement de mode
   */
  private notifySubscribers(event: ModeChangeEvent): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(event);
      } catch (error) {
        console.error('Erreur lors de la notification d\'un abonné:', error);
      }
    });
  }
}

// Exporter une instance singleton
export const connectionModeService = new ConnectionModeService();
