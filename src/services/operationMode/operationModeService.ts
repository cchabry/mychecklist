
import { IOperationModeService, OperationMode, OperationModeSettings, SwitchReason } from './types';
import { DEFAULT_SETTINGS, DEMO_DATABASE_ID, PLACEHOLDER_DATABASE_ID } from './constants';
import { operationModeStorage } from './storage';
import { operationModeNotifications } from './notifications';
import { operationModeUtils } from './utils';

/**
 * Service de gestion du mode opérationnel
 * Permet de basculer entre le mode réel (API Notion) et le mode démo (données simulées)
 */
class OperationModeService implements IOperationModeService {
  // État du service
  private _mode: OperationMode = OperationMode.DEMO;
  private _switchReason: SwitchReason | null = null;
  private _previousMode: OperationMode | null = null;
  private _consecutiveFailures: number = 0;
  private _lastError: Error | null = null;
  private _settings: OperationModeSettings;
  private _listeners: Array<(mode: OperationMode, reason: SwitchReason | null) => void> = [];
  private _criticalOperations: Set<string> = new Set();
  private _temporaryRealMode: boolean = false;
  private _initialized: boolean = false;
  
  constructor() {
    this._settings = { ...DEFAULT_SETTINGS };
    this.initialize();
  }
  
  /**
   * Initialise le service en chargeant les paramètres et le mode depuis le stockage
   */
  private initialize(): void {
    // Charger les paramètres
    if (this._settings.persistentModeStorage) {
      this._settings = operationModeStorage.loadSettings();
    }
    
    // Charger le mode sauvegardé si persistentModeStorage est activé
    if (this._settings.persistentModeStorage) {
      const { mode, reason } = operationModeStorage.loadMode();
      this._mode = mode;
      this._switchReason = reason ? reason : null;
    } else {
      // Sinon, utiliser le mode par défaut des paramètres
      this._mode = this._settings.startInDemoMode ? OperationMode.DEMO : OperationMode.REAL;
    }
    
    // Journaliser l'initialisation
    console.info(`Mode d'opération initialisé: ${this._mode === OperationMode.DEMO ? 'Démo' : 'Réel'}`);
    this._initialized = true;
  }
  
  /**
   * Active le mode démo
   */
  enableDemoMode(reason?: SwitchReason | null): void {
    if (this._mode === OperationMode.DEMO) return;
    
    this._previousMode = this._mode;
    this._mode = OperationMode.DEMO;
    this._switchReason = reason || 'Activation manuelle du mode démo';
    this._consecutiveFailures = 0;
    
    // Sauvegarder le mode si persistentModeStorage est activé
    if (this._settings.persistentModeStorage) {
      operationModeStorage.saveMode(this._mode, this._switchReason);
    }
    
    // Afficher une notification si showNotifications est activé
    if (this._settings.showNotifications) {
      operationModeNotifications.showModeChangeNotification(this._mode, this._switchReason);
    }
    
    // Notifier les listeners
    this.notifyListeners();
  }
  
  /**
   * Active le mode réel
   */
  enableRealMode(reason?: SwitchReason | null): void {
    if (this._mode === OperationMode.REAL) return;
    
    this._previousMode = this._mode;
    this._mode = OperationMode.REAL;
    this._switchReason = reason || 'Activation manuelle du mode réel';
    this._consecutiveFailures = 0;
    this._lastError = null;
    
    // Sauvegarder le mode si persistentModeStorage est activé
    if (this._settings.persistentModeStorage) {
      operationModeStorage.saveMode(this._mode, this._switchReason);
    }
    
    // Afficher une notification si showNotifications est activé
    if (this._settings.showNotifications) {
      operationModeNotifications.showModeChangeNotification(this._mode, this._switchReason);
    }
    
    // Notifier les listeners
    this.notifyListeners();
  }
  
  /**
   * Bascule entre les modes réel et démo
   */
  toggle(): void {
    if (this._mode === OperationMode.DEMO) {
      this.enableRealMode();
    } else {
      this.enableDemoMode();
    }
  }
  
  /**
   * Restaure le mode précédent (après forceReal)
   */
  restorePreviousMode(): void {
    if (this._previousMode !== null) {
      if (this._previousMode === OperationMode.DEMO) {
        this.enableDemoMode('Retour au mode précédent');
      } else {
        this.enableRealMode('Retour au mode précédent');
      }
      this._previousMode = null;
    }
    
    // Réinitialiser le mode réel temporaire
    this._temporaryRealMode = false;
  }
  
  /**
   * Force temporairement le mode réel, généralement pour un test de connexion
   */
  temporarilyForceReal(): void {
    if (this._mode === OperationMode.DEMO) {
      this._previousMode = this._mode;
      this._mode = OperationMode.REAL;
      this._temporaryRealMode = true;
      
      // Ne pas sauvegarder ce changement temporaire
      // Ne pas notifier les listeners pour ce changement temporaire
    }
  }
  
  /**
   * Gère une erreur de connexion
   */
  handleConnectionError(error: Error, context?: string): void {
    this._lastError = error;
    
    // Incrémenter le compteur d'échecs consécutifs
    this._consecutiveFailures++;
    
    // Afficher une notification d'erreur si showNotifications est activé
    if (this._settings.showNotifications) {
      operationModeNotifications.showConnectionErrorNotification(error, context);
    }
    
    // Si autoSwitchOnFailure est activé et que le nombre d'échecs consécutifs est atteint
    if (this._settings.autoSwitchOnFailure && 
        this._mode === OperationMode.REAL && 
        this._consecutiveFailures >= this._settings.maxConsecutiveFailures) {
      
      // Vérifier si c'est une erreur temporaire
      if (operationModeUtils.isTemporaryError(error)) {
        // Si oui, basculer en mode démo
        const reason = `Échec de connexion après ${this._consecutiveFailures} tentatives`;
        
        // Afficher une notification de basculement automatique si showNotifications est activé
        if (this._settings.showNotifications) {
          operationModeNotifications.showAutoSwitchNotification(this._consecutiveFailures);
        }
        
        this.enableDemoMode(reason);
      }
    }
    
    // Si nous sommes en mode réel temporaire, restaurer le mode précédent
    if (this._temporaryRealMode) {
      this.restorePreviousMode();
    }
  }
  
  /**
   * Gère une opération réussie
   */
  handleSuccessfulOperation(): void {
    // Réinitialiser le compteur d'échecs consécutifs et l'erreur
    this._consecutiveFailures = 0;
    this._lastError = null;
    
    // Si nous sommes en mode réel temporaire, restaurer le mode précédent
    if (this._temporaryRealMode) {
      this.restorePreviousMode();
    }
  }
  
  /**
   * Réinitialise l'état du service
   */
  reset(): void {
    this._mode = this._settings.startInDemoMode ? OperationMode.DEMO : OperationMode.REAL;
    this._switchReason = null;
    this._previousMode = null;
    this._consecutiveFailures = 0;
    this._lastError = null;
    this._criticalOperations.clear();
    
    // Effacer les données sauvegardées
    if (this._settings.persistentModeStorage) {
      operationModeStorage.clear();
    }
    
    // Notifier les listeners
    this.notifyListeners();
  }
  
  /**
   * Met à jour les paramètres
   */
  updateSettings(settings: Partial<OperationModeSettings>): void {
    this._settings = { ...this._settings, ...settings };
    
    // Sauvegarder les paramètres si persistentModeStorage est activé
    if (this._settings.persistentModeStorage) {
      operationModeStorage.saveSettings(this._settings);
    }
  }
  
  /**
   * Ajoute un listener pour les changements de mode
   */
  subscribe(listener: (mode: OperationMode, reason: SwitchReason | null) => void): () => void {
    this._listeners.push(listener);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notifie les listeners d'un changement de mode
   */
  private notifyListeners(): void {
    for (const listener of this._listeners) {
      listener(this._mode, this._switchReason);
    }
  }
  
  /**
   * Marque une opération comme critique (ne doit jamais être simulée)
   */
  markOperationAsCritical(operationId: string): void {
    this._criticalOperations.add(operationId);
  }
  
  /**
   * Supprime le marquage critique d'une opération
   */
  unmarkOperationAsCritical(operationId: string): void {
    this._criticalOperations.delete(operationId);
  }
  
  /**
   * Vérifie si une opération est marquée comme critique
   */
  isOperationCritical(operationId: string): boolean {
    return this._criticalOperations.has(operationId);
  }
  
  /**
   * Obtient le mode actuel
   */
  getMode(): OperationMode {
    return this._mode;
  }
  
  /**
   * Vérifie si le mode démo est actif
   */
  isDemoMode(): boolean {
    return this._mode === OperationMode.DEMO;
  }
  
  /**
   * Vérifie si le mode réel est actif
   */
  isRealMode(): boolean {
    return this._mode === OperationMode.REAL;
  }
  
  /**
   * Obtient la raison du changement de mode
   */
  getSwitchReason(): SwitchReason | null {
    return this._switchReason;
  }
  
  /**
   * Obtient le nombre d'échecs consécutifs
   */
  getConsecutiveFailures(): number {
    return this._consecutiveFailures;
  }
  
  /**
   * Obtient la dernière erreur
   */
  getLastError(): Error | null {
    return this._lastError;
  }
  
  /**
   * Obtient les paramètres actuels
   */
  getSettings(): OperationModeSettings {
    return { ...this._settings };
  }
  
  /**
   * Traite un endpoint pour remplacer les placeholders par les vraies valeurs ou des valeurs de démo
   */
  processEndpoint(endpoint: string): string {
    if (this._mode === OperationMode.DEMO) {
      // En mode démo, remplacer les placeholders par des identifiants de démo
      return endpoint.replace(PLACEHOLDER_DATABASE_ID, DEMO_DATABASE_ID);
    } else {
      // En mode réel, tenter de remplacer les placeholders par les vraies valeurs
      const databaseId = localStorage.getItem('notion_database_id') || '';
      const checklistDbId = localStorage.getItem('notion_checklists_database_id') || '';
      
      let processedEndpoint = endpoint;
      
      // Si l'endpoint contient un placeholder et que nous avons une valeur réelle
      if (processedEndpoint.includes(PLACEHOLDER_DATABASE_ID) && databaseId) {
        processedEndpoint = processedEndpoint.replace(PLACEHOLDER_DATABASE_ID, databaseId);
      }
      
      return processedEndpoint;
    }
  }
}

// Exporter une instance singleton
export const operationMode = new OperationModeService();
