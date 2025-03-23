
import { 
  OperationMode, 
  OperationModeSettings, 
  SwitchReason, 
  OperationModeSubscriber,
  IOperationModeService
} from './types';
import { DEFAULT_SETTINGS } from './constants';

class OperationModeService implements IOperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private switchReason: SwitchReason | null = null;
  private settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  private subscribers: OperationModeSubscriber[] = [];
  
  constructor() {
    this.loadPersistedState();
  }
  
  // Propriétés calculées
  public get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  public get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
  
  // Accesseurs d'état
  public getMode(): OperationMode {
    return this.mode;
  }
  
  public getSwitchReason(): SwitchReason | null {
    return this.switchReason;
  }
  
  public getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  // Gestion des abonnements
  public subscribe(subscriber: OperationModeSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }
  
  // Méthodes de changement de mode
  public enableDemoMode(reason: SwitchReason = 'Changement manuel'): void {
    if (this.mode !== OperationMode.DEMO) {
      this.mode = OperationMode.DEMO;
      this.switchReason = reason;
      this.notifySubscribers();
      this.persistState();
    }
  }
  
  public enableRealMode(): void {
    if (this.mode !== OperationMode.REAL) {
      this.mode = OperationMode.REAL;
      this.switchReason = null;
      this.notifySubscribers();
      this.persistState();
    }
  }
  
  public toggle(): void {
    if (this.mode === OperationMode.REAL) {
      this.enableDemoMode('Basculement manuel');
    } else {
      this.enableRealMode();
    }
  }
  
  // Gestion des erreurs
  public handleConnectionError(error: Error, context: string = 'Opération'): void {
    this.lastError = error;
    this.consecutiveFailures++;
    
    console.warn(`[OperationMode] Erreur détectée (${context}): ${error.message}`);
    console.warn(`[OperationMode] Échecs consécutifs: ${this.consecutiveFailures}/${this.settings.maxConsecutiveFailures}`);
    
    // Vérifier s'il faut basculer automatiquement en mode démo
    if (
      this.settings.autoSwitchOnFailure && 
      this.mode === OperationMode.REAL &&
      this.consecutiveFailures >= this.settings.maxConsecutiveFailures
    ) {
      this.enableDemoMode(`Basculement automatique après ${this.consecutiveFailures} échecs`);
    }
    
    this.notifySubscribers();
  }
  
  public handleSuccessfulOperation(): void {
    // Réinitialiser le compteur d'échecs après une opération réussie
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      this.lastError = null;
      this.notifySubscribers();
    }
  }
  
  // Configuration
  public updateSettings(partialSettings: Partial<OperationModeSettings>): void {
    this.settings = {
      ...this.settings,
      ...partialSettings
    };
    this.notifySubscribers();
  }
  
  // Réinitialisation
  public reset(): void {
    this.consecutiveFailures = 0;
    this.lastError = null;
    this.settings = { ...DEFAULT_SETTINGS };
    this.notifySubscribers();
  }
  
  // Méthodes privées
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.mode, this.switchReason);
    }
  }
  
  private persistState(): void {
    if (this.settings.persistentModeStorage) {
      try {
        localStorage.setItem('operation_mode', this.mode);
        localStorage.setItem('operation_mode_reason', this.switchReason || '');
      } catch (error) {
        console.error('Erreur lors de la persistance du mode:', error);
      }
    }
  }
  
  private loadPersistedState(): void {
    if (typeof window !== 'undefined') {
      try {
        // Récupérer le mode persisté si disponible
        const persistedMode = localStorage.getItem('operation_mode') as OperationMode | null;
        const persistedReason = localStorage.getItem('operation_mode_reason') || null;
        
        if (persistedMode && Object.values(OperationMode).includes(persistedMode)) {
          this.mode = persistedMode;
          this.switchReason = persistedReason;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du mode persisté:', error);
      }
    }
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
