import { toast } from 'sonner';
import { operationModeNotifications } from './notifications';
import { OperationMode, OperationModeSettings, SwitchReason } from './types';

/**
 * Type principal pour le service
 */
export type OperationModeType = 'real' | 'demo' | 'auto';

/**
 * Service de gestion des modes opérationnels (réel vs démo)
 * Ce service permet de basculer entre un mode réel (API externes)
 * et un mode démonstration (données simulées)
 */
class OperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private previousMode: OperationMode | null = null;
  private switchReason: string | null = null;
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  private listeners: Function[] = [];
  
  private settings: OperationModeSettings = {
    mode: OperationMode.REAL, // Changed string to enum
    autoSwitchEnabled: false,
    failuresThreshold: 3,
    errorHandling: 'manual',
    autoSwitchOnErrors: false
  };

  /**
   * Constructor avec initialisation des paramètres depuis le localStorage
   */
  constructor() {
    // Charger les paramètres depuis le localStorage
    this.loadSettings();
    
    // Initialiser le mode à partir des paramètres
    this.mode = this.settings.mode;
    
    // Log pour le débogage
    console.log(`[OperationMode] Initialisé en mode: ${this.mode}`);
  }

  /**
   * Charge les paramètres depuis le localStorage
   */
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('operation_mode_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres du mode opérationnel:', error);
    }
  }

  /**
   * Sauvegarde les paramètres dans le localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('operation_mode_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres du mode opérationnel:', error);
    }
  }

  /**
   * Accesseur pour le mode opérationnel
   */
  getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Accesseur pour la raison du basculement
   */
  getSwitchReason(): string | null {
    return this.switchReason;
  }
  
  /**
   * Accesseur pour le nombre d'échecs consécutifs
   */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  /**
   * Accesseur pour la dernière erreur
   */
  getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Accesseur pour les paramètres
   */
  getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Propriété calculée: mode démo activé?
   */
  get isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Propriété calculée: mode réel activé?
   */
  get isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
  
  /**
   * Active le mode démo
   */
  enableDemoMode(reason?: string): void {
    if (this.mode !== OperationMode.DEMO) {
      this.previousMode = this.mode;
      this.mode = OperationMode.DEMO;
      this.switchReason = reason || 'Activé manuellement';
      
      // Mettre à jour les paramètres
      this.settings.mode = OperationMode.DEMO;
      this.saveSettings();
      
      // Afficher une notification
      operationModeNotifications.showModeChangeNotification(OperationMode.DEMO, this.switchReason);
      
      // Notifier les listeners
      this.notifyListeners();
      
      console.log(`[OperationMode] Mode démo activé. Raison: ${this.switchReason}`);
    }
  }
  
  /**
   * Active le mode réel
   */
  enableRealMode(): void {
    if (this.mode !== OperationMode.REAL) {
      this.previousMode = this.mode;
      this.mode = OperationMode.REAL;
      this.switchReason = 'Activé manuellement';
      this.consecutiveFailures = 0;
      
      // Mettre à jour les paramètres
      this.settings.mode = OperationMode.REAL;
      this.saveSettings();
      
      // Afficher une notification
      operationModeNotifications.showModeChangeNotification(OperationMode.REAL);
      
      // Notifier les listeners
      this.notifyListeners();
      
      console.log('[OperationMode] Mode réel activé');
    }
  }
  
  /**
   * Bascule entre les modes réel et démo
   */
  toggle(): void {
    if (this.isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode('Basculement manuel');
    }
  }
  
  /**
   * Gère une erreur de connexion
   */
  handleConnectionError(error: Error, context: string): void {
    console.warn('[OperationMode] Erreur détectée:', error, 'Contexte:', context);
    
    // Enregistrer l'erreur
    this.lastError = error;
    this.consecutiveFailures++;
    
    console.warn('[OperationMode] Échecs consécutifs:', this.consecutiveFailures);
    
    // En mode manuel, uniquement notifier l'erreur sans basculer
    if (this.settings.errorHandling === 'manual') {
      // Uniquement suggérer le mode démo mais ne pas basculer automatiquement
      if (this.consecutiveFailures >= this.settings.failuresThreshold && 
          !this.isDemoMode && 
          this.settings.autoSwitchOnErrors) {
        operationModeNotifications.showSuggestDemoModeNotification();
      }
      return;
    }
    
    // En mode auto, basculer automatiquement après un certain nombre d'échecs
    if (this.settings.autoSwitchEnabled && 
        this.consecutiveFailures >= this.settings.failuresThreshold && 
        !this.isDemoMode) {
      
      // Afficher une notification d'erreurs multiples
      operationModeNotifications.showAutoSwitchNotification(this.consecutiveFailures);
      
      // Basculer en mode démo
      this.enableDemoMode(`${this.consecutiveFailures} erreurs consécutives`);
    }
    
    // Notifier les listeners
    this.notifyListeners();
  }
  
  /**
   * Signale une opération réussie
   */
  handleSuccessfulOperation(): void {
    // Réinitialiser le compteur d'échecs consécutifs
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      this.notifyListeners();
    }
  }
  
  /**
   * Met à jour les paramètres du service
   */
  updateSettings(newSettings: Partial<OperationModeSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    
    // Mettre à jour le mode si nécessaire
    if (newSettings.mode && newSettings.mode !== this.mode) {
      if (newSettings.mode === OperationMode.DEMO) {
        this.enableDemoMode('Changement de paramètres');
      } else if (newSettings.mode === OperationMode.REAL) {
        this.enableRealMode();
      }
    }
    
    // Sauvegarder les paramètres
    this.saveSettings();
    
    // Notifier les listeners
    this.notifyListeners();
    
    console.log('[OperationMode] Paramètres mis à jour:', this.settings);
  }
  
  /**
   * Réinitialise le service
   */
  reset(): void {
    this.mode = OperationMode.REAL;
    this.previousMode = null;
    this.switchReason = null;
    this.consecutiveFailures = 0;
    this.lastError = null;
    
    // Réinitialiser les paramètres
    this.settings = {
      mode: OperationMode.REAL,
      autoSwitchEnabled: false,
      failuresThreshold: 3,
      errorHandling: 'manual',
      autoSwitchOnErrors: false
    };
    
    // Sauvegarder les paramètres
    this.saveSettings();
    
    // Notifier les listeners
    this.notifyListeners();
    
    console.log('[OperationMode] Service réinitialisé');
  }
  
  /**
   * Notifie les listeners d'un changement d'état
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Erreur dans un listener du mode opérationnel:', error);
      }
    });
  }
  
  /**
   * Permet de s'abonner aux changements d'état
   */
  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Exporter l'instance singleton du service
export const operationMode = new OperationModeService();
