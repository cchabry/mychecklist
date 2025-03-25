
/**
 * Adaptateur pour permettre la compatibilité entre l'ancien système operationMode
 * et le nouveau connectionModeService
 * 
 * Cet adaptateur permet une transition progressive vers le nouveau système
 * sans avoir à tout refactoriser immédiatement
 */

import { ConnectionMode, ConnectionHealth, ModeChangeEvent } from '@/services/connection/types';
import { connectionModeService } from '@/services/connection/connectionModeService';
import { 
  OperationMode,
  OperationModeSettings,
  SwitchReason,
  OperationModeSubscriber
} from './types';
import { DEFAULT_SETTINGS } from './constants';

// Mapper les modes entre les deux systèmes
const mapConnectionModeToOperationMode = (mode: ConnectionMode): OperationMode => {
  switch (mode) {
    case ConnectionMode.REAL:
      return OperationMode.REAL;
    case ConnectionMode.DEMO:
      return OperationMode.DEMO;
    default:
      return OperationMode.DEMO;
  }
};

const mapOperationModeToConnectionMode = (mode: OperationMode): ConnectionMode => {
  switch (mode) {
    case OperationMode.REAL:
      return ConnectionMode.REAL;
    case OperationMode.DEMO:
      return ConnectionMode.DEMO;
    default:
      return ConnectionMode.DEMO;
  }
};

// Adaptateur avec l'API de l'ancien operationMode qui délègue au nouveau service
class OperationModeAdapter {
  private subscribers: OperationModeSubscriber[] = [];
  private _lastSwitchReason: SwitchReason | null = null;
  private _settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private criticalOperations: Set<string> = new Set();
  
  // Propriétés calculées pour émuler l'ancien système
  public get isDemoMode(): boolean {
    return connectionModeService.isDemoMode;
  }
  
  public get isRealMode(): boolean {
    return connectionModeService.isRealMode;
  }
  
  // Mode actuel
  public get mode(): OperationMode {
    return mapConnectionModeToOperationMode(connectionModeService.getMode());
  }
  
  public getMode(): OperationMode {
    return this.mode;
  }
  
  // Raison du dernier changement
  public get switchReason(): SwitchReason | null {
    return this._lastSwitchReason;
  }
  
  public getSwitchReason(): SwitchReason | null {
    return this.switchReason;
  }
  
  // Paramètres
  public get settings(): OperationModeSettings {
    return { ...this._settings };
  }
  
  public getSettings(): OperationModeSettings {
    return this.settings;
  }
  
  // Compteur d'échecs
  public get failures(): number {
    return connectionModeService.getConnectionHealth().consecutiveErrors;
  }
  
  public getConsecutiveFailures(): number {
    return this.failures;
  }
  
  // Dernière erreur
  public get lastError(): Error | null {
    return connectionModeService.getConnectionHealth().lastError;
  }
  
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  // Méthodes d'action pour la compatibilité
  public enableDemoMode(reason: SwitchReason = 'Changement manuel'): void {
    this._lastSwitchReason = reason;
    connectionModeService.enableDemoMode(reason);
  }
  
  public enableRealMode(): void {
    this._lastSwitchReason = null;
    connectionModeService.enableRealMode();
  }
  
  public toggle(): void {
    if (this.isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode('Basculement manuel');
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
    // Stocker l'erreur et le contexte pour référence future
    this._lastSwitchReason = context;
    connectionModeService.handleConnectionError(error);
  }
  
  public handleSuccessfulOperation(): void {
    connectionModeService.handleSuccessfulOperation();
  }
  
  public updateSettings(partialSettings: Partial<OperationModeSettings>): void {
    this._settings = {
      ...this._settings,
      ...partialSettings
    };
  }
  
  public reset(): void {
    // Réinitialiser le compteur d'erreurs
    connectionModeService.handleSuccessfulOperation();
  }
  
  public temporarilyForceReal(): void {
    connectionModeService.temporarilyForceReal();
  }
  
  public restorePreviousMode(): void {
    connectionModeService.restoreMode();
  }
  
  // Rendre les alias disponibles pour maintenir la compatibilité
  public restoreMode = this.restorePreviousMode;
  
  // Gestion des abonnés pour les changements de mode
  public subscribe(subscriber: OperationModeSubscriber): () => void {
    this.subscribers.push(subscriber);
    
    // S'abonner au nouveau service pour propager les événements
    const unsubscribe = connectionModeService.subscribe((event: ModeChangeEvent) => {
      const newMode = mapConnectionModeToOperationMode(event.currentMode);
      const reason = event.reason;
      this._lastSwitchReason = reason;
      
      // Notifier l'abonné
      subscriber(newMode, reason);
    });
    
    // Retourner une fonction pour se désabonner des deux systèmes
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
      unsubscribe();
    };
  }
  
  public onModeChange(subscriber: (isDemoMode: boolean) => void): () => void {
    const adapter: OperationModeSubscriber = (mode) => {
      subscriber(mode === OperationMode.DEMO);
    };
    
    return this.subscribe(adapter);
  }
  
  public offModeChange(subscriber: (isDemoMode: boolean) => void): void {
    // Cette méthode est maintenue pour compatibilité mais n'a plus d'utilité réelle
  }
  
  // Méthodes spécifiques pour les opérations critiques (émulation simplifiée)
  public markOperationAsCritical(operationContext: string): void {
    this.criticalOperations.add(operationContext);
  }

  public unmarkOperationAsCritical(operationContext: string): void {
    this.criticalOperations.delete(operationContext);
  }

  public isOperationCritical(operationContext: string): boolean {
    return this.criticalOperations.has(operationContext);
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeAdapter();
