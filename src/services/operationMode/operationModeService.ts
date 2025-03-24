
import { toast } from 'sonner';

export type OperationModeType = 'demo' | 'real' | 'auto';

interface OperationModeSettings {
  /**
   * Mode actif actuel
   */
  mode: OperationModeType;
  
  /**
   * Mode forcé (ignore le mode automatique)
   */
  forcedMode: OperationModeType | null;
  
  /**
   * Indique si le mode démo est temporairement activé
   */
  temporaryDemo: boolean;
  
  /**
   * Compteur d'échecs consécutifs
   */
  consecutiveFailures: number;
  
  /**
   * Timestamp de la dernière erreur
   */
  lastErrorTimestamp: number | null;
  
  /**
   * Dernière opération réussie
   */
  lastSuccessTimestamp: number | null;
}

const DEFAULT_SETTINGS: OperationModeSettings = {
  mode: 'auto',
  forcedMode: null,
  temporaryDemo: false,
  consecutiveFailures: 0,
  lastErrorTimestamp: null,
  lastSuccessTimestamp: null
};

/**
 * Nombre maximum d'échecs consécutifs avant de basculer automatiquement en mode démo
 * Désactivé (valeur élevée) car nous préférons afficher les erreurs
 */
const MAX_CONSECUTIVE_FAILURES = 999;

/**
 * Délai après lequel réinitialiser le compteur d'échecs (ms)
 */
const FAILURE_RESET_DELAY = 10 * 60 * 1000; // 10 minutes

class OperationModeService {
  private settings: OperationModeSettings;
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    this.settings = this.loadSettings();
    
    // Si le mode temporaire est activé depuis plus de 30 minutes, le désactiver
    if (this.settings.temporaryDemo) {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (this.settings.lastErrorTimestamp && this.settings.lastErrorTimestamp < thirtyMinutesAgo) {
        this.settings.temporaryDemo = false;
        this.saveSettings();
      }
    }
    
    // Réinitialiser le compteur d'échecs si le dernier échec date d'il y a longtemps
    if (this.settings.consecutiveFailures > 0 && 
        this.settings.lastErrorTimestamp && 
        Date.now() - this.settings.lastErrorTimestamp > FAILURE_RESET_DELAY) {
      this.resetFailureCounter();
    }
  }
  
  /**
   * Charge les paramètres depuis le stockage local
   */
  private loadSettings(): OperationModeSettings {
    try {
      const stored = localStorage.getItem('operation_mode_settings');
      if (stored) {
        return JSON.parse(stored) as OperationModeSettings;
      }
    } catch (e) {
      console.error('Erreur lors du chargement des paramètres:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }
  
  /**
   * Sauvegarde les paramètres dans le stockage local
   */
  private saveSettings() {
    try {
      localStorage.setItem('operation_mode_settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des paramètres:', e);
    }
  }
  
  /**
   * Notifie tous les écouteurs d'un changement de mode
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
  
  /**
   * Ajoute un écouteur pour les changements de mode
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Réinitialise le compteur d'échecs
   */
  private resetFailureCounter() {
    this.settings.consecutiveFailures = 0;
    this.saveSettings();
  }
  
  /**
   * Active temporairement le mode démo
   */
  public temporarilyActivateDemoMode() {
    if (this.isDemoMode) return; // Déjà en mode démo
    
    console.log('Activation temporaire du mode démo');
    this.settings.temporaryDemo = true;
    this.settings.lastErrorTimestamp = Date.now();
    this.saveSettings();
    
    toast.info('Mode démonstration temporairement activé', {
      description: 'L\'application utilise des données simulées pour cette opération.'
    });
  }
  
  /**
   * Désactive le mode démo temporaire
   */
  public resetTemporaryMode() {
    if (!this.settings.temporaryDemo) return;
    
    console.log('Désactivation du mode démo temporaire');
    this.settings.temporaryDemo = false;
    this.saveSettings();
  }
  
  /**
   * Gère une erreur de connexion - ne bascule plus automatiquement
   */
  public handleConnectionError(error: Error, context: string) {
    console.warn(`[OperationMode] Erreur détectée (${context}):`, error);
    
    // Incrémenter le compteur d'échecs
    this.settings.consecutiveFailures++;
    this.settings.lastErrorTimestamp = Date.now();
    console.warn(`[OperationMode] Échecs consécutifs: ${this.settings.consecutiveFailures}`);
    
    // Afficher l'erreur plutôt que de basculer en mode démo
    toast.error(`Erreur: ${context}`, {
      description: error.message,
      duration: 8000
    });
    
    this.saveSettings();
  }
  
  /**
   * Gère une opération réussie
   */
  public handleSuccessfulOperation() {
    // Si nous avions des échecs, réinitialiser le compteur
    if (this.settings.consecutiveFailures > 0) {
      console.log('[OperationMode] Opération réussie, réinitialisation du compteur d\'échecs');
      this.resetFailureCounter();
    }
    
    // Si nous étions en mode démo temporaire, revenir au mode normal
    if (this.settings.temporaryDemo) {
      console.log('[OperationMode] Opération réussie, désactivation du mode démo temporaire');
      this.resetTemporaryMode();
    }
    
    this.settings.lastSuccessTimestamp = Date.now();
    this.saveSettings();
  }
  
  /**
   * Définit le mode d'opération
   */
  public setMode(mode: OperationModeType) {
    this.settings.mode = mode;
    
    // Si on passe en mode réel, réinitialiser les compteurs d'erreurs
    if (mode === 'real') {
      this.resetFailureCounter();
      this.resetTemporaryMode();
    }
    
    this.saveSettings();
    
    return this;
  }
  
  /**
   * Force un mode spécifique (ignore le mode automatique)
   */
  public forceMode(mode: OperationModeType | null) {
    this.settings.forcedMode = mode;
    
    // Si on force le mode réel, réinitialiser les compteurs d'erreurs
    if (mode === 'real') {
      this.resetFailureCounter();
      this.resetTemporaryMode();
    }
    
    this.saveSettings();
    
    return this;
  }
  
  /**
   * Active le mode démo explicitement
   */
  public enableDemoMode(reason?: string) {
    console.log('[OperationMode] Activation du mode démo:', reason || 'Action manuelle');
    this.forceMode('demo');
    
    return this;
  }
  
  /**
   * Active le mode réel explicitement
   */
  public enableRealMode() {
    console.log('[OperationMode] Activation du mode réel');
    this.forceMode('real');
    
    return this;
  }
  
  /**
   * Indique si le mode démo est actuellement actif
   */
  public get isDemoMode(): boolean {
    // Mode forcé prioritaire
    if (this.settings.forcedMode) {
      return this.settings.forcedMode === 'demo';
    }
    
    // Mode temporaire ensuite
    if (this.settings.temporaryDemo) {
      return true;
    }
    
    // Enfin, le mode défini
    if (this.settings.mode === 'auto') {
      // En mode auto, vérifier les échecs récents
      return this.settings.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
    }
    
    return this.settings.mode === 'demo';
  }
  
  /**
   * Indique si le mode réel est actuellement actif
   */
  public get isRealMode(): boolean {
    return !this.isDemoMode;
  }
  
  /**
   * Retourne l'état actuel du mode opérationnel
   */
  public getStatus() {
    return {
      currentMode: this.isDemoMode ? 'demo' : 'real',
      configuredMode: this.settings.mode,
      forcedMode: this.settings.forcedMode,
      temporaryDemo: this.settings.temporaryDemo,
      consecutiveFailures: this.settings.consecutiveFailures,
      lastErrorTimestamp: this.settings.lastErrorTimestamp,
      lastSuccessTimestamp: this.settings.lastSuccessTimestamp
    };
  }
  
  /**
   * Obtient le mode opérationnel actuel en tant qu'enum
   */
  public getMode() {
    return this.isDemoMode ? 'demo' : 'real';
  }
  
  /**
   * Obtient la raison du dernier changement de mode
   */
  public getSwitchReason(): string | null {
    // Pas implémenté pour simplifier
    return null;
  }
  
  /**
   * Obtient le nombre d'échecs consécutifs
   */
  public getConsecutiveFailures(): number {
    return this.settings.consecutiveFailures;
  }
  
  /**
   * Obtient la dernière erreur
   */
  public getLastError(): Error | null {
    // Pas implémenté pour simplifier
    return null;
  }
  
  /**
   * Obtient les paramètres complets
   */
  public getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Met à jour les paramètres
   */
  public updateSettings(newSettings: Partial<OperationModeSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    return this;
  }
  
  /**
   * Réinitialise les paramètres
   */
  public reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    return this;
  }
  
  /**
   * Bascule entre les modes
   */
  public toggle() {
    if (this.isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode();
    }
    return this;
  }
}

// Exporter une instance du service
export const operationMode = new OperationModeService();
