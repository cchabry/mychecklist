
import { 
  OperationMode, 
  OperationModeSettings, 
  SwitchReason, 
  OperationModeSubscriber,
  IOperationModeService
} from './types';
import { DEFAULT_SETTINGS } from './constants';
import { operationModeStorage } from './storage';
import { operationModeNotifications } from './notifications';

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
  
  // Alias pour la compatibilité avec l'ancien système
  public onModeChange(subscriber: (isDemoMode: boolean) => void): () => void {
    // Adaptateur qui convertit les callbacks de l'ancien format (isDemoMode)
    // vers le nouveau format (mode, reason)
    const adapter: OperationModeSubscriber = (mode) => {
      subscriber(mode === OperationMode.DEMO);
    };
    
    return this.subscribe(adapter);
  }
  
  // Alias pour la compatibilité avec l'ancien système
  public offModeChange(subscriber: (isDemoMode: boolean) => void): void {
    // Supprimer tous les abonnements qui correspondent à cette fonction
    this.subscribers = this.subscribers.filter(s => s !== subscriber);
  }
  
  // Méthodes de changement de mode
  public enableDemoMode(reason: SwitchReason = 'Changement manuel'): void {
    if (this.mode !== OperationMode.DEMO) {
      this.mode = OperationMode.DEMO;
      this.switchReason = reason;
      
      // Notification de changement
      if (this.settings.showNotifications) {
        operationModeNotifications.showModeChangeNotification(OperationMode.DEMO, reason);
      }
      
      this.notifySubscribers();
      this.persistState();
    }
  }
  
  public enableRealMode(): void {
    if (this.mode !== OperationMode.REAL) {
      this.mode = OperationMode.REAL;
      this.switchReason = null;
      
      // Notification de changement
      if (this.settings.showNotifications) {
        operationModeNotifications.showModeChangeNotification(OperationMode.REAL);
      }
      
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
  
  // Alias pour la compatibilité avec l'ancien système
  public toggleMode(): void {
    this.toggle();
  }
  
  // Alias pour la compatibilité avec l'ancien système
  public setDemoMode(value: boolean): void {
    if (value) {
      this.enableDemoMode('Changement manuel');
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
      const reason = `Basculement automatique après ${this.consecutiveFailures} échecs`;
      this.enableDemoMode(reason);
      
      // Notification spécifique pour le switch automatique
      if (this.settings.showNotifications) {
        operationModeNotifications.showAutoSwitchNotification(this.consecutiveFailures);
      }
    } else if (this.settings.showNotifications) {
      // Notification d'erreur standard
      operationModeNotifications.showConnectionErrorNotification(error, context);
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
    
    // Persister les paramètres
    operationModeStorage.saveSettings(this.settings);
    
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
      operationModeStorage.saveMode(this.mode, this.switchReason);
    }
  }
  
  private loadPersistedState(): void {
    // Charger les paramètres
    this.settings = operationModeStorage.loadSettings();
    
    // Charger le mode 
    if (this.settings.persistentModeStorage) {
      const { mode, reason } = operationModeStorage.loadMode();
      this.mode = mode;
      this.switchReason = reason;
    }
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
