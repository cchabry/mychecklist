
import { OperationMode, OperationModeSettings, SwitchReason } from './types';

// Interface pour les abonnés au changement de mode
type OperationModeSubscriber = (mode: OperationMode, reason: SwitchReason | null) => void;

// État initial du service
const DEFAULT_SETTINGS: OperationModeSettings = {
  maxConsecutiveFailures: 3,
  autoSwitchOnFailure: true,
  persistentModeStorage: true,
  notificationDuration: 5000
};

/**
 * Service central pour la gestion du mode opérationnel de l'application
 * Remplace le système mockMode avec une API plus robuste et flexible
 */
class OperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private switchReason: SwitchReason | null = null;
  private settings: OperationModeSettings = DEFAULT_SETTINGS;
  private subscribers: OperationModeSubscriber[] = [];
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  private storageKey = 'operation_mode';
  
  constructor() {
    this.loadModeFromStorage();
    console.log(`OperationModeService initialisé en mode: ${this.mode}`);
  }
  
  /**
   * Charge le mode depuis le stockage local
   */
  private loadModeFromStorage(): void {
    if (this.settings.persistentModeStorage) {
      try {
        const savedMode = localStorage.getItem(this.storageKey);
        const savedReason = localStorage.getItem(`${this.storageKey}_reason`);
        
        if (savedMode === OperationMode.DEMO) {
          this.mode = OperationMode.DEMO;
          this.switchReason = savedReason || 'Mode démo activé manuellement';
          console.log('Mode démo chargé depuis le stockage');
        } else {
          this.mode = OperationMode.REAL;
          this.switchReason = null;
        }
      } catch (e) {
        console.warn('Impossible de charger le mode depuis localStorage:', e);
      }
    }
  }
  
  /**
   * Sauvegarde le mode dans le stockage local
   */
  private saveModeToStorage(): void {
    if (this.settings.persistentModeStorage) {
      try {
        if (this.mode === OperationMode.DEMO) {
          localStorage.setItem(this.storageKey, this.mode);
          if (this.switchReason) {
            localStorage.setItem(`${this.storageKey}_reason`, this.switchReason);
          }
        } else {
          localStorage.removeItem(this.storageKey);
          localStorage.removeItem(`${this.storageKey}_reason`);
        }
      } catch (e) {
        console.warn('Impossible de sauvegarder le mode dans localStorage:', e);
      }
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
    if (this.mode !== newMode) {
      this.mode = newMode;
      this.switchReason = reason;
      
      // Réinitialiser les échecs consécutifs lors d'un changement de mode manuel
      if (reason && !reason.includes('automatique')) {
        this.consecutiveFailures = 0;
      }
      
      this.saveModeToStorage();
      this.notifySubscribers();
      
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
      this.setMode(
        OperationMode.DEMO, 
        `Basculement automatique après ${this.consecutiveFailures} échecs consécutifs`
      );
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
  public isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Indique si le mode réel est actif
   */
  public isRealMode(): boolean {
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
    
    console.warn(`Erreur de connexion (${context || 'inconnu'}):`, error.message);
    
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
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(`${this.storageKey}_reason`);
    this.notifySubscribers();
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
