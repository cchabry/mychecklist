
/**
 * Service pour gérer le mode d'opération de l'application
 * Permet de basculer entre le mode réel et le mode démo
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Clé de stockage local pour le mode d'opération
const OPERATION_MODE_KEY = 'operation_mode';
// Valeurs possibles pour le mode d'opération
const DEMO_MODE = 'demo';
const REAL_MODE = 'real';

// Paramètres par défaut pour le mode démo
const DEFAULT_SETTINGS = {
  simulatedNetworkDelay: 300, // ms
  errorSimulationRate: 0, // pourcentage (0-100)
  saveToLocalStorage: true, // sauvegarder les modifications localement
  purgeOnExit: false, // purger les données locales lors de la déconnexion
};

// Interface pour les événements de mode d'opération
interface OperationModeEvent {
  type: 'mode_change' | 'settings_change' | 'connection_error' | 'success';
  mode?: string;
  detail?: any;
}

/**
 * Service principal pour gérer le mode d'opération
 */
export const operationMode = {
  // État courant du mode d'opération
  isDemoMode: false,
  
  // Paramètres du mode démo
  settings: { ...DEFAULT_SETTINGS },
  
  // Liste des écouteurs d'événements
  listeners: new Set<(event: OperationModeEvent) => void>(),
  
  /**
   * Initialise le service
   */
  initialize() {
    // Charger le mode depuis le localStorage
    const savedMode = localStorage.getItem(OPERATION_MODE_KEY);
    this.isDemoMode = savedMode === DEMO_MODE;
    
    // Notifier du mode initial
    this._notifyListeners({
      type: 'mode_change',
      mode: this.isDemoMode ? DEMO_MODE : REAL_MODE
    });
    
    console.log(`Mode d'opération initialisé: ${this.isDemoMode ? 'Démo' : 'Réel'}`);
  },
  
  /**
   * Active le mode démo
   */
  enableDemoMode() {
    if (!this.isDemoMode) {
      this.isDemoMode = true;
      localStorage.setItem(OPERATION_MODE_KEY, DEMO_MODE);
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: DEMO_MODE
      });
      
      toast.success('Mode démonstration activé', {
        description: 'L\'application utilise maintenant des données de démonstration.'
      });
      
      console.log('Mode démo activé');
    }
  },
  
  /**
   * Active le mode réel
   */
  enableRealMode() {
    if (this.isDemoMode) {
      this.isDemoMode = false;
      localStorage.setItem(OPERATION_MODE_KEY, REAL_MODE);
      
      // Notifier du changement
      this._notifyListeners({
        type: 'mode_change',
        mode: REAL_MODE
      });
      
      toast.success('Mode réel activé', {
        description: 'L\'application utilise maintenant l\'API Notion.'
      });
      
      console.log('Mode réel activé');
    }
  },
  
  /**
   * Bascule entre les modes démo et réel
   */
  toggleMode() {
    if (this.isDemoMode) {
      this.enableRealMode();
    } else {
      this.enableDemoMode();
    }
  },
  
  /**
   * Met à jour les paramètres du mode démo
   */
  updateSettings(newSettings: Partial<typeof DEFAULT_SETTINGS>) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    
    // Notifier du changement
    this._notifyListeners({
      type: 'settings_change',
      detail: this.settings
    });
    
    console.log('Paramètres du mode démo mis à jour:', this.settings);
  },
  
  /**
   * Gère une erreur de connexion et active automatiquement le mode démo
   */
  handleConnectionError(error: Error, context: string) {
    console.error(`Erreur de connexion dans ${context}:`, error);
    
    // Si on est déjà en mode démo, ne rien faire
    if (this.isDemoMode) {
      return;
    }
    
    // Notifier de l'erreur
    this._notifyListeners({
      type: 'connection_error',
      detail: { error, context }
    });
    
    // Activer automatiquement le mode démo
    this.enableDemoMode();
    
    // Afficher une notification
    toast.error('Problème de connexion', {
      description: 'Mode démonstration activé automatiquement suite à une erreur de connexion.'
    });
  },
  
  /**
   * Signale une opération réussie
   */
  handleSuccessfulOperation() {
    // Notifier du succès
    this._notifyListeners({
      type: 'success'
    });
  },
  
  /**
   * Ajoute un écouteur d'événements
   */
  addEventListener(callback: (event: OperationModeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  /**
   * Notifie tous les écouteurs d'un événement
   */
  _notifyListeners(event: OperationModeEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Erreur dans un écouteur de mode d\'opération:', e);
      }
    });
  }
};

// Initialiser le service au chargement
operationMode.initialize();

/**
 * Hook pour utiliser le mode d'opération dans les composants React
 */
export function useOperationMode() {
  const [isDemoMode, setIsDemoMode] = useState(operationMode.isDemoMode);
  const [settings, setSettings] = useState(operationMode.settings);
  
  // Écouter les changements de mode
  useEffect(() => {
    const unsubscribe = operationMode.addEventListener((event) => {
      if (event.type === 'mode_change') {
        setIsDemoMode(event.mode === DEMO_MODE);
      } else if (event.type === 'settings_change') {
        setSettings(event.detail);
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Actions exposées par le hook
  const enableDemoMode = useCallback(() => operationMode.enableDemoMode(), []);
  const enableRealMode = useCallback(() => operationMode.enableRealMode(), []);
  const toggleMode = useCallback(() => operationMode.toggleMode(), []);
  const updateSettings = useCallback(
    (newSettings: Partial<typeof DEFAULT_SETTINGS>) => operationMode.updateSettings(newSettings),
    []
  );
  
  return {
    isDemoMode,
    settings,
    enableDemoMode,
    enableRealMode,
    toggleMode,
    updateSettings
  };
}

// Exporter par défaut pour un accès facile
export default operationMode;
