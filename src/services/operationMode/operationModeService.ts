
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
  private previousMode: OperationMode | null = null;
  private temporarilyForcedReal: boolean = false;
  
  constructor() {
    this.loadPersistedState();
  }
  
  public get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  public get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
  
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

  public markOperationAsCritical(operationContext: string): void {
    this.criticalOperations.add(operationContext);
  }

  public unmarkOperationAsCritical(operationContext: string): void {
    this.criticalOperations.delete(operationContext);
  }

  public isOperationCritical(operationContext: string): boolean {
    return this.criticalOperations.has(operationContext);
  }
  
  public subscribe(subscriber: OperationModeSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }
  
  public onModeChange(subscriber: (isDemoMode: boolean) => void): () => void {
    const adapter: OperationModeSubscriber = (mode) => {
      subscriber(mode === OperationMode.DEMO);
    };
    
    return this.subscribe(adapter);
  }
  
  public offModeChange(subscriber: (isDemoMode: boolean) => void): void {
    this.subscribers = this.subscribers.filter(s => {
      if (typeof s === 'function') {
        return true;
      }
      return true;
    });
  }
  
  public enableDemoMode(reason: SwitchReason = 'Changement manuel'): void {
    if (this.mode !== OperationMode.DEMO) {
      if (!this.temporarilyForcedReal) {
        this.previousMode = this.mode;
      }
      
      this.mode = OperationMode.DEMO;
      this.switchReason = reason;
      this.temporarilyForcedReal = false;
      
      if (this.settings.showNotifications) {
        operationModeNotifications.showModeChangeNotification(OperationMode.DEMO, reason);
      }
      
      this.notifySubscribers();
      this.persistState();
    }
  }
  
  public enableRealMode(): void {
    if (this.mode !== OperationMode.REAL) {
      if (!this.temporarilyForcedReal) {
        this.previousMode = this.mode;
      }
      
      this.mode = OperationMode.REAL;
      this.switchReason = null;
      this.temporarilyForcedReal = false;
      
      this.consecutiveFailures = 0;
      this.lastError = null;
      
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
  
  public toggleMode(): void {
    this.toggle();
  }
  
  public setDemoMode(value: boolean): void {
    if (value) {
      this.enableDemoMode('Changement manuel');
    } else {
      this.enableRealMode();
    }
  }
  
  public handleConnectionError(error: Error, context: string = 'Opération', isNonCritical: boolean = false): void {
    this.lastError = error;
    
    const isTemporaryError = this.isTemporaryError(error);
    const isCriticalOperation = this.isOperationCritical(context);
    
    if ((!isTemporaryError && !isNonCritical) || isCriticalOperation) {
      this.consecutiveFailures++;
      console.warn(`[OperationMode] Erreur critique détectée (${context}): ${error.message}`);
      console.warn(`[OperationMode] Échecs consécutifs: ${this.consecutiveFailures}/${this.settings.maxConsecutiveFailures}`);
    } else {
      console.warn(`[OperationMode] Erreur temporaire ou non critique ignorée (${context}): ${error.message}`);
    }
    
    const shouldSwitch = 
      this.settings.autoSwitchOnFailure && 
      this.mode === OperationMode.REAL &&
      this.consecutiveFailures >= this.settings.maxConsecutiveFailures &&
      !isTemporaryError && 
      !isNonCritical;
    
    if (shouldSwitch) {
      const reason = `Basculement automatique après ${this.consecutiveFailures} échecs`;
      this.enableDemoMode(reason);
      
      if (this.settings.showNotifications) {
        operationModeNotifications.showAutoSwitchNotification(this.consecutiveFailures);
      }
    } else if (this.settings.showNotifications && isCriticalOperation) {
      operationModeNotifications.showConnectionErrorNotification(error, context);
    }
    
    this.notifySubscribers();
  }
  
  private isTemporaryError(error: Error): boolean {
    return operationModeUtils.isTemporaryError(error);
  }
  
  public handleSuccessfulOperation(): void {
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      this.lastError = null;
      this.notifySubscribers();
    }
  }
  
  public updateSettings(partialSettings: Partial<OperationModeSettings>): void {
    this.settings = {
      ...this.settings,
      ...partialSettings
    };
    
    operationModeStorage.saveSettings(this.settings);
    
    this.notifySubscribers();
  }
  
  public reset(): void {
    this.consecutiveFailures = 0;
    this.lastError = null;
    this.settings = { ...DEFAULT_SETTINGS };
    this.criticalOperations.clear();
    this.notifySubscribers();
  }
  
  public temporarilyForceReal(): void {
    if (this.isDemoMode && !this.temporarilyForcedReal) {
      this.previousMode = this.mode;
      this.temporarilyForcedReal = true;
      this.mode = OperationMode.REAL;
      
      this.notifySubscribers();
    }
  }
  
  public restorePreviousMode(): void {
    if (this.temporarilyForcedReal && this.previousMode) {
      this.mode = this.previousMode;
      this.previousMode = null;
      this.temporarilyForcedReal = false;
      
      this.notifySubscribers();
      this.persistState();
    }
  }
  
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
    this.settings = operationModeStorage.loadSettings();
    
    if (this.settings.persistentModeStorage) {
      const { mode, reason } = operationModeStorage.loadMode();
      this.mode = mode;
      this.switchReason = reason;
    }
  }
}

export const operationMode = new OperationModeService();
