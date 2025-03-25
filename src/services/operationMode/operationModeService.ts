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
import { operationModeUtils } from './utils';

class OperationModeService implements IOperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private switchReason: SwitchReason | null = null;
  private settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  private subscribers: OperationModeSubscriber[] = [];
  private criticalOperations: Set<string> = new Set();
  private temporaryErrorPatterns: RegExp[] = [
    /Failed to fetch/i,
    /Network error/i,
    /timeout/i,
    /Timed out/i,
    /CORS/i,
    /headers/i
  ];
  
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

  // Gestion des opérations critiques
  public markOperationAsCritical(operationContext: string): void {
    this.criticalOperations.add(operationContext);
  }

  public unmarkOperationAsCritical(operationContext: string): void {
    this.criticalOperations.delete(operationContext);
  }

  public isOperationCritical(operationContext: string): boolean {
    return this.criticalOperations.has(operationContext);
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
    this.subscribers = this.subscribers.filter(s => {
      // Check if s is a function, and if it's our adapter
      if (typeof s === 'function') {
        // We can't directly compare functions, so we'll keep all subscribers
        // This is a simplification; in a real app we would use a Map to track adapters
        return true;
      }
      return true;
    });
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
      
      // Réinitialiser le compteur d'échecs lors du passage en mode réel
      this.consecutiveFailures = 0;
      this.lastError = null;
      
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
  
  // Gestion des erreurs avec une logique améliorée
  public handleConnectionError(error: Error, context: string = 'Opération', isNonCritical: boolean = false): void {
    console.log(`🔍 [DEBUG] handleConnectionError appelé - Context: ${context}, isNonCritical: ${isNonCritical}`);
    console.log(`🔍 [DEBUG] Message d'erreur:`, error.message);
    console.log(`🔍 [DEBUG] Mode actuel:`, this.mode);
    
    this.lastError = error;
    
    // Vérifier si l'erreur semble temporaire (réseau, CORS, etc.)
    const isTemporaryError = this.isTemporaryError(error);
    console.log(`🔍 [DEBUG] Est-ce une erreur temporaire?`, isTemporaryError);
    
    // Vérifier si l'opération est marquée comme critique
    const isCriticalOperation = this.isOperationCritical(context);
    console.log(`🔍 [DEBUG] Est-ce une opération critique?`, isCriticalOperation);
    
    // Ne pas incrémenter le compteur d'échecs pour:
    // - les erreurs temporaires 
    // - les erreurs explicitement marquées comme non critiques
    // - sauf si l'opération est critique
    if ((!isTemporaryError && !isNonCritical) || isCriticalOperation) {
      this.consecutiveFailures++;
      console.warn(`[OperationMode] Erreur critique détectée (${context}): ${error.message}`);
      console.warn(`[OperationMode] Échecs consécutifs: ${this.consecutiveFailures}/${this.settings.maxConsecutiveFailures}`);
    } else {
      console.warn(`[OperationMode] Erreur temporaire ou non critique ignorée (${context}): ${error.message}`);
    }
    
    // Vérifier s'il faut basculer automatiquement en mode démo - seulement si:
    // - l'option autoSwitchOnFailure est activée
    // - nous sommes en mode réel
    // - le nombre d'échecs atteint le seuil
    // - l'erreur n'est pas temporaire ou non critique
    console.log(`🔍 [DEBUG] autoSwitchOnFailure activé?`, this.settings.autoSwitchOnFailure);
    console.log(`🔍 [DEBUG] Nombre d'échecs:`, this.consecutiveFailures);
    console.log(`🔍 [DEBUG] Seuil d'échecs:`, this.settings.maxConsecutiveFailures);
    
    const shouldSwitch = 
      this.settings.autoSwitchOnFailure && 
      this.mode === OperationMode.REAL &&
      this.consecutiveFailures >= this.settings.maxConsecutiveFailures &&
      !isTemporaryError && 
      !isNonCritical;
    
    console.log(`🔍 [DEBUG] Faut-il basculer en mode démo?`, shouldSwitch);
    
    if (shouldSwitch) {
      const reason = `Basculement automatique après ${this.consecutiveFailures} échecs`;
      console.log(`🔍 [DEBUG] Basculement en mode démo avec raison:`, reason);
      this.enableDemoMode(reason);
      
      // Notification spécifique pour le switch automatique
      if (this.settings.showNotifications) {
        operationModeNotifications.showAutoSwitchNotification(this.consecutiveFailures);
      }
    } else if (this.settings.showNotifications && isCriticalOperation) {
      // Notification d'erreur standard uniquement pour les opérations critiques
      operationModeNotifications.showConnectionErrorNotification(error, context);
    }
    
    this.notifySubscribers();
    console.log(`🔍 [DEBUG] Fin de handleConnectionError - Mode actuel:`, this.mode);
  }

  // Vérifier si une erreur est probablement temporaire (réseau, CORS)
  private isTemporaryError(error: Error): boolean {
    return operationModeUtils.isTemporaryError(error);
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
    this.criticalOperations.clear();
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
