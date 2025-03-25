
import { OperationModeSettings, OperationMode } from './types';
import { DEFAULT_SETTINGS } from './constants';

/**
 * Service centralisé pour gérer le mode opérationnel de l'application
 * (mode réel vs mode démo)
 */
export class OperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private settings: OperationModeSettings = DEFAULT_SETTINGS;
  private switchReason: string | null = null;
  private consecutiveFailures: number = 0;
  private lastErrorTimestamp: number | null = null;
  private lastError: Error | null = null;
  private listeners: Array<(mode: OperationMode, reason: string | null) => void> = [];
  
  constructor() {
    // Charger la configuration depuis le stockage local
    this.loadFromStorage();
  }
  
  /**
   * Charge l'état du mode depuis le stockage local
   */
  private loadFromStorage(): void {
    try {
      // Charger les paramètres
      const settingsStr = localStorage.getItem('operation_mode_settings');
      if (settingsStr) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) };
      }
      
      // Charger le mode s'il est persistant
      if (this.settings.persistentModeStorage) {
        const modeStr = localStorage.getItem('operation_mode');
        if (modeStr) {
          const { mode, reason } = JSON.parse(modeStr);
          this.mode = mode as OperationMode;
          this.switchReason = reason;
          
          console.log(`[OperationMode] Mode chargé: ${this.getModeName()} (${reason || 'raison non spécifiée'})`);
        }
      }
    } catch (error) {
      console.error('[OperationMode] Erreur lors du chargement des paramètres:', error);
      // En cas d'erreur, utiliser les paramètres par défaut
      this.settings = DEFAULT_SETTINGS;
    }
  }
  
  /**
   * Persiste l'état du mode dans le stockage local
   */
  private saveToStorage(): void {
    try {
      // Sauvegarder les paramètres
      localStorage.setItem('operation_mode_settings', JSON.stringify(this.settings));
      
      // Sauvegarder le mode si persistant
      if (this.settings.persistentModeStorage) {
        localStorage.setItem('operation_mode', JSON.stringify({
          mode: this.mode,
          reason: this.switchReason
        }));
      }
    } catch (error) {
      console.error('[OperationMode] Erreur lors de la sauvegarde des paramètres:', error);
    }
  }
  
  /**
   * Active le mode démo
   */
  public enableDemoMode(reason: string = 'Activation manuelle'): void {
    if (this.mode === OperationMode.DEMO) return;
    
    this.mode = OperationMode.DEMO;
    this.switchReason = reason;
    console.log(`[OperationMode] Mode démo activé: ${reason}`);
    
    this.saveToStorage();
    this.notifyListeners();
  }
  
  /**
   * Active le mode réel
   */
  public enableRealMode(reason: string = 'Activation manuelle'): void {
    if (this.mode === OperationMode.REAL) return;
    
    this.mode = OperationMode.REAL;
    this.switchReason = reason;
    console.log(`[OperationMode] Mode réel activé: ${reason}`);
    
    // Réinitialiser le compteur d'échecs
    this.consecutiveFailures = 0;
    
    this.saveToStorage();
    this.notifyListeners();
  }
  
  /**
   * Bascule entre les modes réel et démo
   */
  public toggle(): void {
    if (this.mode === OperationMode.REAL) {
      this.enableDemoMode('Basculement manuel');
    } else {
      this.enableRealMode('Basculement manuel');
    }
  }
  
  /**
   * Met à jour les paramètres du mode
   */
  public updateSettings(newSettings: Partial<OperationModeSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('[OperationMode] Paramètres mis à jour:', this.settings);
    
    this.saveToStorage();
  }
  
  /**
   * Réinitialise tous les paramètres
   */
  public reset(): void {
    this.settings = DEFAULT_SETTINGS;
    this.consecutiveFailures = 0;
    this.lastError = null;
    console.log('[OperationMode] Paramètres réinitialisés');
    
    localStorage.removeItem('operation_mode');
    localStorage.removeItem('operation_mode_settings');
  }
  
  /**
   * Gère une erreur de connexion
   */
  public handleConnectionError(error: Error, context: string = 'Operation'): void {
    console.warn(`[OperationMode] Erreur détectée (${context}): ${error.message}`, error);
    
    // Incrémenter le compteur d'échecs consécutifs
    this.consecutiveFailures++;
    console.warn(`[OperationMode] Échecs consécutifs: ${this.consecutiveFailures}/${this.settings.maxConsecutiveFailures}`);
    
    this.lastErrorTimestamp = Date.now();
    this.lastError = error;
    
    // En mode réel et si le basculement automatique est activé, envisager le passage en mode démo
    // NB: Désactivé pour les tests sur demande de l'utilisateur
    /*
    if (this.mode === OperationMode.REAL && 
        this.settings.autoSwitchOnFailure && 
        this.consecutiveFailures >= this.settings.maxConsecutiveFailures) {
      
      this.enableDemoMode(`Basculement automatique après ${this.consecutiveFailures} échecs`);
    }
    */
  }
  
  /**
   * Gère une opération réussie
   */
  public handleSuccessfulOperation(): void {
    // Réinitialiser le compteur d'échecs
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      console.log('[OperationMode] Compteur d\'échecs réinitialisé après opération réussie');
    }
  }
  
  /**
   * Ajoute un écouteur pour les changements de mode
   */
  public addListener(listener: (mode: OperationMode, reason: string | null) => void): () => void {
    this.listeners.push(listener);
    
    // Notifier immédiatement le nouvel écouteur
    listener(this.mode, this.switchReason);
    
    // Retourner une fonction pour supprimer l'écouteur
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notifie tous les écouteurs d'un changement de mode
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.mode, this.switchReason);
      } catch (error) {
        console.error('[OperationMode] Erreur lors de la notification d\'un écouteur:', error);
      }
    });
  }
  
  /**
   * Définit le mode directement (utilisé principalement pour les tests)
   */
  public setDemoMode(enabled: boolean): void {
    if (enabled) {
      this.enableDemoMode('Défini manuellement');
    } else {
      this.enableRealMode('Défini manuellement');
    }
  }
  
  /**
   * Retourne le mode actuel
   */
  public getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Retourne la raison du dernier changement de mode
   */
  public getSwitchReason(): string | null {
    return this.switchReason;
  }
  
  /**
   * Retourne les paramètres actuels
   */
  public getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Retourne le nombre d'échecs consécutifs
   */
  public getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  /**
   * Retourne le timestamp de la dernière erreur
   */
  public getLastErrorTimestamp(): number | null {
    return this.lastErrorTimestamp;
  }
  
  /**
   * Récupère la dernière erreur
   */
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Retourne le nom du mode actuel (pour affichage)
   */
  public getModeName(): string {
    return this.mode === OperationMode.DEMO ? 'Démonstration' : 'Réel';
  }
  
  /**
   * Propriété pour vérifier si le mode démo est actif
   */
  public get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Propriété pour vérifier si le mode réel est actif
   */
  public get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
}

// Créer et exporter une instance unique du service
export const operationMode = new OperationModeService();
