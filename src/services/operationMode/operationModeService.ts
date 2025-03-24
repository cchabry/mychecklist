
import { localStorageUtils } from '@/utils/localStorage';
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
 */
const MAX_CONSECUTIVE_FAILURES = 3;

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
    const storedSettings = localStorageUtils.get<OperationModeSettings>('operation_mode_settings');
    return storedSettings || { ...DEFAULT_SETTINGS };
  }
  
  /**
   * Sauvegarde les paramètres dans le stockage local
   */
  private saveSettings() {
    localStorageUtils.set('operation_mode_settings', this.settings);
    this.notifyListeners();
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
   * Gère une erreur de connexion
   */
  public handleConnectionError(error: Error, context: string) {
    console.warn(`[OperationMode] Erreur détectée (${context}):`, error);
    
    // Incrémenter le compteur d'échecs
    this.settings.consecutiveFailures++;
    this.settings.lastErrorTimestamp = Date.now();
    console.warn(`[OperationMode] Échecs consécutifs: ${this.settings.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`);
    
    // Si nous atteignons le seuil, basculer en mode démo
    if (this.settings.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && !this.isDemoMode) {
      console.warn('[OperationMode] Trop d\'échecs consécutifs, activation du mode démo');
      
      // Activer temporairement le mode démo
      this.temporarilyActivateDemoMode();
      
      // Afficher une notification
      toast.warning('Mode démonstration activé', {
        description: 'Après plusieurs erreurs, l\'application est passée en mode démonstration.'
      });
    }
    
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
}

export const operationModeService = new OperationModeService();
