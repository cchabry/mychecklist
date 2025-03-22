
import { OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { operationModeStorage } from './storage';
import { operationModeNotifications } from './notifications';

// Interface pour les abonnés au changement de mode
type OperationModeSubscriber = (mode: OperationMode, reason: SwitchReason | null) => void;

/**
 * Service central pour la gestion du mode opérationnel de l'application
 */
class OperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private switchReason: SwitchReason | null = null;
  private settings: OperationModeSettings = DEFAULT_SETTINGS;
  private subscribers: OperationModeSubscriber[] = [];
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  
  constructor() {
    this.loadModeFromStorage();
    console.log(`OperationModeService initialisé en mode: ${this.mode}`);
  }
  
  /**
   * Charge le mode depuis le stockage local
   */
  private loadModeFromStorage(): void {
    if (this.settings.persistentModeStorage) {
      const { mode, reason } = operationModeStorage.loadMode();
      if (mode === OperationMode.DEMO) {
        this.mode = OperationMode.DEMO;
        this.switchReason = reason;
        console.log('Mode démo chargé depuis le stockage');
      }
    }
  }
  
  /**
   * Sauvegarde le mode dans le stockage local
   */
  private saveModeToStorage(): void {
    if (this.settings.persistentModeStorage) {
      operationModeStorage.saveMode(this.mode, this.switchReason);
    }
  }
  
  /**
   * Notifie tous les abonnés d'un changement de mode
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this.mode, this.switchReason);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
  }
  
  /**
   * Définit le mode d'opération et notifie les abonnés
   */
  private setMode(newMode: OperationMode, reason: SwitchReason | null = null): void {
    const previousMode = this.mode;
    
    if (previousMode !== newMode) {
      this.mode = newMode;
      this.switchReason = reason;
      
      // Réinitialiser les échecs consécutifs lors d'un changement de mode manuel
      if (reason && !reason.includes('automatique')) {
        this.consecutiveFailures = 0;
      }
      
      this.saveModeToStorage();
      this.notifySubscribers();
      
      // Afficher une notification si le mode a changé
      operationModeNotifications.showModeChangeNotification(newMode, reason);
      
      console.log(`Mode opérationnel changé: ${newMode}${reason ? ` (${reason})` : ''}`);
    }
  }
  
  /**
   * Vérifie si le passage automatique au mode démo est nécessaire
   */
  private checkAutoSwitch(): void {
    if (
      this.settings.autoSwitchOnFailure && 
      this.mode === OperationMode.REAL && 
      this.consecutiveFailures >= this.settings.maxConsecutiveFailures
    ) {
      const reason = `Basculement automatique après ${this.consecutiveFailures} échecs consécutifs`;
      this.setMode(OperationMode.DEMO, reason);
      
      // Notification spécifique pour le basculement automatique
      operationModeNotifications.showAutoSwitchNotification(this.consecutiveFailures);
    }
  }
  
  // API Publique
  
  /**
   * S'abonne aux changements de mode
   * @returns Fonction de désabonnement
   */
  public subscribe(subscriber: OperationModeSubscriber): () => void {
    this.subscribers.push(subscriber);
    
    // Appeler immédiatement avec l'état actuel
    subscriber(this.mode, this.switchReason);
    
    // Retourner la fonction de désabonnement
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Active le mode démonstration
   */
  public enableDemoMode(reason: SwitchReason = 'Mode démo activé manuellement'): void {
    this.setMode(OperationMode.DEMO, reason);
  }
  
  /**
   * Active le mode réel
   */
  public enableRealMode(): void {
    // Réinitialiser les compteurs d'erreur
    this.consecutiveFailures = 0;
    this.lastError = null;
    
    this.setMode(OperationMode.REAL, null);
  }
  
  /**
   * Bascule entre les modes réel et démo
   * @returns Le nouveau mode
   */
  public toggle(): OperationMode {
    const newMode = this.mode === OperationMode.REAL ? 
      OperationMode.DEMO : 
      OperationMode.REAL;
    
    const reason = newMode === OperationMode.DEMO ? 
      'Mode démo activé manuellement' : 
      null;
    
    this.setMode(newMode, reason);
    return newMode;
  }
  
  /**
   * Indique si le mode démo est actif
   */
  public get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Indique si le mode réel est actif
   */
  public get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
  
  /**
   * Obtient les paramètres actuels
   */
  public getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Met à jour les paramètres
   */
  public updateSettings(newSettings: Partial<OperationModeSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  /**
   * Gère une erreur de connexion
   * @param error L'erreur rencontrée
   * @param context Contexte de l'erreur
   */
  public handleConnectionError(error: Error, context?: string): void {
    this.consecutiveFailures++;
    this.lastError = error;
    
    const contextStr = context || 'inconnu';
    console.warn(`Erreur de connexion (${contextStr}):`, error.message);
    
    // Notification d'erreur
    operationModeNotifications.showConnectionErrorNotification(error, contextStr);
    
    // Vérifier si on doit basculer automatiquement
    this.checkAutoSwitch();
  }
  
  /**
   * Signale une opération réussie
   */
  public handleSuccessfulOperation(): void {
    // Réinitialiser le compteur d'échecs consécutifs
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      console.log('Compteur d\'échecs réinitialisé suite à une opération réussie');
    }
  }
  
  /**
   * Obtient le nombre d'échecs consécutifs
   */
  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  /**
   * Obtient la dernière erreur
   */
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Obtient la raison du dernier changement de mode
   */
  public getSwitchReason(): SwitchReason | null {
    return this.switchReason;
  }
  
  /**
   * Obtient le mode actuel
   */
  public getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Réinitialise complètement le service
   * Principalement utilisé pour les tests
   */
  public reset(): void {
    this.mode = OperationMode.REAL;
    this.switchReason = null;
    this.consecutiveFailures = 0;
    this.lastError = null;
    operationModeStorage.clearMode();
    this.notifySubscribers();
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
