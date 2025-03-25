
/**
 * Service pour gérer le mode d'opération de l'application
 * Permet de basculer entre le mode réel et le mode démo
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { OperationMode, OperationModeSettings, SwitchReason } from './operationMode/types';

// Clé de stockage local pour le mode d'opération
const OPERATION_MODE_KEY = 'operation_mode';

// Paramètres par défaut pour le mode démo
const DEFAULT_SETTINGS: OperationModeSettings = {
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchOnFailure: true,
  
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: 3,
  
  // Conserver le mode entre les sessions
  persistentModeStorage: true,
  
  // Afficher les notifications de changement de mode
  showNotifications: true,
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: true,
  
  // Taux d'erreurs simulées en mode démo (pourcentage)
  errorSimulationRate: 10,
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: 300
};

// Interface pour les événements de mode d'opération
interface OperationModeEvent {
  type: 'mode_change' | 'settings_change' | 'connection_error' | 'success';
  mode?: OperationMode;
  detail?: any;
}

/**
 * Service principal pour gérer le mode d'opération
 */
class OperationModeService {
  // État courant du mode d'opération
  private _mode: OperationMode = OperationMode.REAL;
  private _switchReason: SwitchReason | null = null;
  private _settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private _consecutiveFailures: number = 0;
  private _lastError: Error | null = null;
  private _previousMode: OperationMode | null = null;
  private _temporarilyForcedReal: boolean = false;
  private _criticalOperations: Set<string> = new Set();
  
  // Liste des écouteurs d'événements
  private _listeners: Set<(event: OperationModeEvent) => void> = new Set();
  
  /**
   * Initialise le service
   */
  constructor() {
    this.initialize();
  }
  
  public initialize() {
    // Charger le mode depuis le localStorage
    if (this._settings.persistentModeStorage) {
      const savedMode = localStorage.getItem(OPERATION_MODE_KEY);
      if (savedMode === OperationMode.DEMO) {
        this._mode = OperationMode.DEMO;
        this._switchReason = localStorage.getItem('operation_mode_reason') || 'Précédemment configuré';
      }
    }
    
    // Notifier du mode initial
    this._notifyListeners({
      type: 'mode_change',
      mode: this._mode
    });
    
    console.log(`Mode d'opération initialisé: ${this.isDemoMode ? 'Démo' : 'Réel'}`);
  }
  
  // Accesseurs
  public get isDemoMode(): boolean {
    return this._mode === OperationMode.DEMO;
  }
  
  public get isRealMode(): boolean {
    return this._mode === OperationMode.REAL;
  }
  
  public getMode(): OperationMode {
    return this._mode;
  }
  
  public getSwitchReason(): SwitchReason | null {
    return this._switchReason;
  }
  
  public getSettings(): OperationModeSettings {
    return { ...this._settings };
  }
  
  public getConsecutiveFailures(): number {
    return this._consecutiveFailures;
  }
  
  public getLastError(): Error | null {
    return this._lastError;
  }
  
  // Méthodes de gestion des opérations critiques
  public markOperationAsCritical(operationContext: string): void {
    this._criticalOperations.add(operationContext);
  }
  
  public unmarkOperationAsCritical(operationContext: string): void {
    this._criticalOperations.delete(operationContext);
  }
  
  public isOperationCritical(operationContext: string): boolean {
    return this._criticalOperations.has(operationContext);
  }
  
  /**
   * Active le mode démo
   */
  public enableDemoMode(reason: SwitchReason = 'Changement manuel'): void {
    if (this._mode !== OperationMode.DEMO) {
      if (!this._temporarilyForcedReal) {
        this._previousMode = this._mode;
      }
      
      this._mode = OperationMode.DEMO;
      this._switchReason = reason;
      this._temporarilyForcedReal = false;
      
      if (this._settings.persistentModeStorage) {
        localStorage.setItem(OPERATION_MODE_KEY, OperationMode.DEMO);
        localStorage.setItem('operation_mode_reason', reason);
      }
      
      if (this._settings.showNotifications) {
        toast.success('Mode démonstration activé', {
          description: 'L\'application utilise maintenant des données simulées'
        });
      }
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: this._mode
      });
      
      console.log('Mode démo activé - Raison:', reason);
    }
  }
  
  /**
   * Active le mode réel
   */
  public enableRealMode(): void {
    if (this._mode !== OperationMode.REAL) {
      if (!this._temporarilyForcedReal) {
        this._previousMode = this._mode;
      }
      
      this._mode = OperationMode.REAL;
      this._switchReason = null;
      this._temporarilyForcedReal = false;
      
      if (this._settings.persistentModeStorage) {
        localStorage.setItem(OPERATION_MODE_KEY, OperationMode.REAL);
        localStorage.removeItem('operation_mode_reason');
      }
      
      // Réinitialiser les compteurs d'échec
      this._consecutiveFailures = 0;
      this._lastError = null;
      
      if (this._settings.showNotifications) {
        toast.success('Mode réel activé', {
          description: 'L\'application utilise maintenant l\'API Notion'
        });
      }
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: this._mode
      });
      
      console.log('Mode réel activé');
    }
  }
  
  /**
   * Bascule entre les modes démo et réel
   */
  public toggle(): void {
    if (this._mode === OperationMode.REAL) {
      this.enableDemoMode('Basculement manuel');
    } else {
      this.enableRealMode();
    }
  }
  
  /**
   * Alias pour toggle()
   */
  public toggleMode(): void {
    this.toggle();
  }
  
  /**
   * Set directement le mode démo
   */
  public setDemoMode(value: boolean): void {
    if (value) {
      this.enableDemoMode('Changement manuel');
    } else {
      this.enableRealMode();
    }
  }
  
  /**
   * Force temporairement le mode réel
   */
  public temporarilyForceReal(): void {
    if (this.isDemoMode && !this._temporarilyForcedReal) {
      this._previousMode = this._mode;
      this._temporarilyForcedReal = true;
      this._mode = OperationMode.REAL;
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: this._mode
      });
      
      console.log('Mode démo temporairement désactivé');
    }
  }
  
  /**
   * Restaure le mode précédent
   */
  public restorePreviousMode(): void {
    if (this._temporarilyForcedReal && this._previousMode) {
      this._mode = this._previousMode;
      this._previousMode = null;
      this._temporarilyForcedReal = false;
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: this._mode
      });
      
      console.log('Mode précédent restauré');
    }
  }
  
  /**
   * Gère une erreur de connexion et active automatiquement le mode démo
   */
  public handleConnectionError(error: Error, context: string = 'Opération', isNonCritical: boolean = false): void {
    this._lastError = error;
    
    const isCriticalOperation = this.isOperationCritical(context);
    
    // Augmenter le compteur d'échecs uniquement pour les erreurs non temporaires
    if (!isNonCritical || isCriticalOperation) {
      this._consecutiveFailures++;
      console.warn(`[OperationMode] Erreur détectée (${context}): ${error.message}`);
      console.warn(`[OperationMode] Échecs consécutifs: ${this._consecutiveFailures}/${this._settings.maxConsecutiveFailures}`);
    }
    
    // Notifier de l'erreur
    this._notifyListeners({
      type: 'connection_error',
      detail: { error, context }
    });
    
    // Déterminer s'il faut basculer automatiquement en mode démo
    const shouldSwitch = 
      this._settings.autoSwitchOnFailure && 
      this._mode === OperationMode.REAL &&
      this._consecutiveFailures >= this._settings.maxConsecutiveFailures;
    
    if (shouldSwitch) {
      const reason = `Basculement automatique après ${this._consecutiveFailures} échecs`;
      this.enableDemoMode(reason);
    }
  }
  
  /**
   * Signale une opération réussie
   */
  public handleSuccessfulOperation(): void {
    if (this._consecutiveFailures > 0) {
      this._consecutiveFailures = 0;
      this._lastError = null;
      
      // Notifier du succès
      this._notifyListeners({
        type: 'success'
      });
    }
  }
  
  /**
   * Met à jour les paramètres du mode démo
   */
  public updateSettings(newSettings: Partial<OperationModeSettings>): void {
    this._settings = {
      ...this._settings,
      ...newSettings
    };
    
    // Sauvegarder les paramètres dans le localStorage
    if (this._settings.persistentModeStorage) {
      localStorage.setItem('operation_mode_settings', JSON.stringify(this._settings));
    }
    
    // Notifier du changement
    this._notifyListeners({
      type: 'settings_change',
      detail: this._settings
    });
    
    console.log('Paramètres du mode démo mis à jour:', this._settings);
  }
  
  /**
   * Réinitialise l'état
   */
  public reset(): void {
    this._consecutiveFailures = 0;
    this._lastError = null;
    this._settings = { ...DEFAULT_SETTINGS };
    this._criticalOperations.clear();
    
    // Notifier du changement
    this._notifyListeners({
      type: 'settings_change',
      detail: this._settings
    });
    
    console.log('État réinitialisé');
  }
  
  /**
   * Ajoute un écouteur d'événements
   */
  public subscribe(callback: (mode: OperationMode, reason?: SwitchReason | null) => void): () => void {
    const adapter = (event: OperationModeEvent) => {
      if (event.type === 'mode_change' && event.mode) {
        callback(event.mode, this._switchReason);
      }
    };
    
    this._listeners.add(adapter);
    return () => this._listeners.delete(adapter);
  }
  
  /**
   * Ajoute un écouteur pour les changements de mode
   */
  public onModeChange(callback: (isDemoMode: boolean) => void): () => void {
    const adapter = (event: OperationModeEvent) => {
      if (event.type === 'mode_change') {
        callback(this.isDemoMode);
      }
    };
    
    this._listeners.add(adapter);
    return () => this._listeners.delete(adapter);
  }
  
  /**
   * Supprime un écouteur pour les changements de mode
   */
  public offModeChange(callback: (isDemoMode: boolean) => void): void {
    // La suppression effective est difficile car nous n'avons pas de référence directe
    // à l'adaptateur créé dans onModeChange. Cette méthode est incluse pour la compatibilité.
    console.warn('offModeChange: Cette méthode n\'est pas complètement implémentée');
  }
  
  /**
   * Ajoute un écouteur d'événements générique
   */
  public addEventListener(callback: (event: OperationModeEvent) => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
  
  /**
   * Notifie tous les écouteurs d'un événement
   */
  private _notifyListeners(event: OperationModeEvent): void {
    this._listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Erreur dans un écouteur de mode d\'opération:', e);
      }
    });
  }
}

// Créer et exporter une instance unique du service
export const operationMode = new OperationModeService();

/**
 * Hook pour utiliser le mode d'opération dans les composants React
 */
export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>(operationMode.getMode());
  const [switchReason, setSwitchReason] = useState<SwitchReason | null>(operationMode.getSwitchReason());
  const [failures, setFailures] = useState<number>(operationMode.getConsecutiveFailures());
  const [lastError, setLastError] = useState<Error | null>(operationMode.getLastError());
  const [settings, setSettings] = useState<OperationModeSettings>(operationMode.getSettings());
  
  // Écouter les changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.addEventListener((event) => {
      if (event.type === 'mode_change') {
        setMode(operationMode.getMode());
        setSwitchReason(operationMode.getSwitchReason());
        setFailures(operationMode.getConsecutiveFailures());
        setLastError(operationMode.getLastError());
      } else if (event.type === 'settings_change') {
        setSettings(operationMode.getSettings());
      } else if (event.type === 'connection_error') {
        setFailures(operationMode.getConsecutiveFailures());
        setLastError(operationMode.getLastError());
      } else if (event.type === 'success') {
        setFailures(operationMode.getConsecutiveFailures());
        setLastError(operationMode.getLastError());
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Calculer les propriétés dérivées
  const isDemoMode = mode === OperationMode.DEMO;
  const isRealMode = mode === OperationMode.REAL;
  
  // Actions exposées par le hook
  const enableDemoMode = useCallback((reason?: SwitchReason) => operationMode.enableDemoMode(reason), []);
  const enableRealMode = useCallback(() => operationMode.enableRealMode(), []);
  const toggle = useCallback(() => operationMode.toggle(), []);
  const updateSettings = useCallback(
    (newSettings: Partial<OperationModeSettings>) => operationMode.updateSettings(newSettings),
    []
  );
  const handleConnectionError = useCallback(
    (error: Error, context?: string, isNonCritical?: boolean) => 
      operationMode.handleConnectionError(error, context, isNonCritical),
    []
  );
  const handleSuccessfulOperation = useCallback(
    () => operationMode.handleSuccessfulOperation(),
    []
  );
  const reset = useCallback(() => operationMode.reset(), []);
  const markOperationAsCritical = useCallback(
    (context: string) => operationMode.markOperationAsCritical(context),
    []
  );
  const unmarkOperationAsCritical = useCallback(
    (context: string) => operationMode.unmarkOperationAsCritical(context),
    []
  );
  const isOperationCritical = useCallback(
    (context: string) => operationMode.isOperationCritical(context),
    []
  );
  const temporarilyForceReal = useCallback(
    () => operationMode.temporarilyForceReal(),
    []
  );
  const restorePreviousMode = useCallback(
    () => operationMode.restorePreviousMode(),
    []
  );
  
  return {
    // État
    mode,
    switchReason,
    failures,
    lastError,
    settings,
    
    // Propriétés calculées
    isDemoMode,
    isRealMode,
    
    // Actions
    enableDemoMode,
    enableRealMode,
    toggle,
    toggleMode: toggle,
    updateSettings,
    handleConnectionError,
    handleSuccessfulOperation,
    reset,
    markOperationAsCritical,
    unmarkOperationAsCritical,
    isOperationCritical,
    temporarilyForceReal,
    restorePreviousMode
  };
}

// Export par défaut pour un accès facile
export default operationMode;
