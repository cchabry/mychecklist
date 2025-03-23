
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

/**
 * Service central pour la gestion du mode opérationnel de l'application
 */
class OperationModeService implements IOperationModeService {
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
    this.setMode(OperationMode.REAL);
  }
  
  /**
   * Bascule entre les modes réel et démo
   */
  public toggle(): void {
    if (this.mode === OperationMode.REAL) {
      this.enableDemoMode();
    } else {
      this.enableRealMode();
    }
  }
  
  /**
   * Signale une erreur de connexion
   */
  public handleConnectionError(error: Error, context: string = 'Opération'): void {
    console.error(`Erreur de connexion (${context}):`, error);
    
    this.lastError = error;
    this.consecutiveFailures++;
    
    // Afficher une notification d'erreur
    operationModeNotifications.showConnectionErrorNotification(error, context);
    
    // Vérifier si le basculement automatique est nécessaire
    this.checkAutoSwitch();
  }
  
  /**
   * Signale une opération réussie
   */
  public handleSuccessfulOperation(): void {
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      console.log('Compteur d\'erreurs réinitialisé après une opération réussie');
    }
  }
  
  /**
   * Met à jour les paramètres du service
   */
  public updateSettings(partialSettings: Partial<OperationModeSettings>): void {
    this.settings = { ...this.settings, ...partialSettings };
    
    // Sauvegarder les paramètres si nécessaire
    if (this.settings.persistentModeStorage) {
      operationModeStorage.saveSettings(this.settings);
    }
    
    console.log('Paramètres du mode opérationnel mis à jour:', partialSettings);
  }
  
  /**
   * Réinitialise complètement le service
   */
  public reset(): void {
    this.mode = OperationMode.REAL;
    this.switchReason = null;
    this.settings = { ...DEFAULT_SETTINGS };
    this.consecutiveFailures = 0;
    this.lastError = null;
    
    // Nettoyer le stockage
    operationModeStorage.clear();
    
    // Notifier les abonnés du changement
    this.notifySubscribers();
    
    console.log('Service de mode opérationnel réinitialisé');
  }
  
  // Accesseurs
  
  /**
   * Récupère le mode opérationnel actuel
   */
  public getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Récupère la raison du changement de mode
   */
  public getSwitchReason(): SwitchReason | null {
    return this.switchReason;
  }
  
  /**
   * Récupère les paramètres actuels
   */
  public getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Récupère le nombre d'échecs consécutifs
   */
  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  /**
   * Récupère la dernière erreur enregistrée
   */
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Vérifie si le mode démonstration est actif
   */
  public get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Vérifie si le mode réel est actif
   */
  public get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
}

// Instancier et exporter le service
export const operationMode = new OperationModeService();
