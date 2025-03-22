
import { OperationMode, OperationModeState, OperationModeSettings, defaultSettings } from './types';

// Seuil d'erreurs consécutives avant de basculer en mode démo
const MAX_CONSECUTIVE_FAILURES = 3;

// Clé de stockage localstorage
const STORAGE_KEY = 'operation_mode';
const SETTINGS_KEY = 'operation_mode_settings';

/**
 * Service de gestion du mode d'opération (réel ou démo)
 */
class OperationModeService {
  // État interne
  private state: OperationModeState = {
    mode: OperationMode.REAL,
    switchReason: null,
    lastError: null,
    consecutiveFailures: 0,
    failures: 0
  };
  
  // Paramètres configurables
  private _settings: OperationModeSettings = { ...defaultSettings };
  
  // Abonnés aux changements
  private listeners: Set<(mode: OperationMode) => void> = new Set();
  
  constructor() {
    this.loadState();
    this.loadSettings();
  }
  
  /**
   * Obtient le mode actuel
   */
  get mode(): OperationMode {
    return this.state.mode;
  }
  
  /**
   * Vérifie si le mode démo est actif
   */
  get isDemoMode(): boolean {
    return this.state.mode === OperationMode.DEMO;
  }
  
  /**
   * Vérifie si le mode réel est actif
   */
  get isRealMode(): boolean {
    return this.state.mode === OperationMode.REAL;
  }
  
  /**
   * Vérifie si le mode transition est actif
   */
  get isTransitioning(): boolean {
    return this.state.mode === OperationMode.TRANSITIONING;
  }
  
  /**
   * Raison du basculement de mode
   */
  get switchReason(): string | null {
    return this.state.switchReason;
  }
  
  /**
   * Dernière erreur rencontrée
   */
  get lastError(): Error | null {
    return this.state.lastError;
  }
  
  /**
   * Nombre d'échecs consécutifs
   */
  get failures(): number {
    return this.state.failures;
  }
  
  /**
   * Active le mode démonstration
   */
  enableDemoMode = (reason: string = 'Activation manuelle'): void => {
    if (this.state.mode === OperationMode.DEMO) return;
    
    console.log(`Basculement en mode démonstration. Raison: ${reason}`);
    
    this.state.mode = OperationMode.DEMO;
    this.state.switchReason = reason;
    
    this.saveState();
    this.notifyListeners();
  };
  
  /**
   * Active le mode réel
   */
  enableRealMode = (): void => {
    if (this.state.mode === OperationMode.REAL) return;
    
    console.log('Basculement en mode réel');
    
    this.state.mode = OperationMode.REAL;
    this.state.switchReason = null;
    this.state.failures = 0;
    
    this.saveState();
    this.notifyListeners();
  };
  
  /**
   * Bascule entre les modes
   */
  toggle = (): OperationMode => {
    if (this.state.mode === OperationMode.REAL) {
      this.enableDemoMode('Activation manuelle');
    } else {
      this.enableRealMode();
    }
    return this.state.mode;
  };
  
  /**
   * Gère un cas d'erreur de connexion
   */
  handleConnectionError = (error: Error, context: string): void => {
    console.warn(`Erreur de connexion (${context}):`, error);
    
    this.state.lastError = error;
    this.state.failures++;
    
    // Si la bascule automatique est activée et qu'on a atteint le seuil d'échecs
    if (this._settings.autoFallbackEnabled && 
        this.state.failures >= MAX_CONSECUTIVE_FAILURES &&
        this.state.mode === OperationMode.REAL) {
      this.enableDemoMode(`Erreurs répétées (${context})`);
    } else {
      // Sinon juste sauvegarder l'état pour suivre les échecs
      this.saveState();
    }
  };
  
  /**
   * Gère un cas d'opération réussie
   */
  handleSuccessfulOperation = (): void => {
    if (this.state.failures > 0) {
      this.state.failures = 0;
      this.saveState();
    }
  };
  
  /**
   * Mettre à jour les paramètres
   */
  updateSettings = (settings: Partial<OperationModeSettings>): void => {
    this._settings = { ...this._settings, ...settings };
    this.saveSettings();
  };
  
  /**
   * Obtient les paramètres
   */
  get settings(): OperationModeSettings {
    return { ...this._settings };
  }
  
  /**
   * S'abonner aux changements de mode
   */
  subscribe = (listener: (mode: OperationMode) => void): () => void => {
    this.listeners.add(listener);
    
    // Appeler immédiatement avec l'état actuel
    listener(this.state.mode);
    
    // Renvoyer une fonction de désabonnement
    return () => this.listeners.delete(listener);
  };
  
  /**
   * Charger l'état depuis le stockage local
   */
  private loadState(): void {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        this.state = { ...this.state, ...parsedState };
        console.log('Mode d\'opération chargé:', this.state.mode);
      }
    } catch (e) {
      console.warn('Erreur lors du chargement du mode d\'opération:', e);
    }
  }
  
  /**
   * Sauvegarder l'état dans le stockage local
   */
  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde du mode d\'opération:', e);
    }
  }
  
  /**
   * Charger les paramètres depuis le stockage local
   */
  private loadSettings(): void {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        this._settings = { ...this._settings, ...parsedSettings };
      }
    } catch (e) {
      console.warn('Erreur lors du chargement des paramètres du mode d\'opération:', e);
    }
  }
  
  /**
   * Sauvegarder les paramètres dans le stockage local
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this._settings));
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde des paramètres du mode d\'opération:', e);
    }
  }
  
  /**
   * Notifier tous les abonnés d'un changement de mode
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state.mode);
      } catch (e) {
        console.error('Erreur dans un écouteur du mode d\'opération:', e);
      }
    }
  }
}

// Créer et exporter l'instance singleton du service
export const operationModeService = new OperationModeService();
