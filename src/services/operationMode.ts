
import { toast } from 'sonner';

/**
 * Types de mode de fonctionnement de l'application
 */
export enum OperationMode {
  /**
   * Mode réel - connexion directe à l'API Notion
   */
  REAL = 'real',
  
  /**
   * Mode démo - utilise des données fictives
   */
  DEMO = 'demo',
  
  /**
   * Mode transitoire - en cours de tentative de connexion
   */
  TRANSITIONING = 'transitioning'
}

// Clé de stockage localStorage
const MODE_STORAGE_KEY = 'app_operation_mode';

// Paramètres
interface OperationModeSettings {
  autoSwitch: boolean;     // Basculement automatique vers le mode démo en cas d'erreur
  notifyOnSwitch: boolean; // Notification lors du basculement automatique
  persistMode: boolean;    // Mémoriser le mode entre les sessions
}

// Configuration par défaut
const DEFAULT_SETTINGS: OperationModeSettings = {
  autoSwitch: true,
  notifyOnSwitch: true,
  persistMode: true
};

/**
 * Service de gestion du mode de fonctionnement de l'application
 */
class OperationModeService {
  private mode: OperationMode = OperationMode.REAL;
  private settings: OperationModeSettings = { ...DEFAULT_SETTINGS };
  private switchReason: string | null = null;
  private consecutiveFailures: number = 0;
  private lastError: Error | null = null;
  private listeners: Set<Function> = new Set();
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Obtient le mode actuel
   */
  getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Vérifie si on est en mode démonstration
   */
  isDemoMode(): boolean {
    return this.mode === OperationMode.DEMO;
  }
  
  /**
   * Vérifie si on est en mode réel
   */
  isRealMode(): boolean {
    return this.mode === OperationMode.REAL;
  }
  
  /**
   * Vérifie si on est en mode transition
   */
  isTransitioning(): boolean {
    return this.mode === OperationMode.TRANSITIONING;
  }
  
  /**
   * Active manuellement le mode démonstration
   */
  enableDemoMode(reason: string = 'Activation manuelle'): void {
    this.switchToMode(OperationMode.DEMO, reason);
  }
  
  /**
   * Active manuellement le mode réel
   */
  enableRealMode(): boolean {
    if (this.lastError && this.consecutiveFailures > 0) {
      toast.warning('Échecs précédents détectés', {
        description: 'Des problèmes de connexion ont été détectés précédemment'
      });
    }
    
    this.switchToMode(OperationMode.REAL, 'Activation manuelle');
    return true;
  }
  
  /**
   * Obtient les paramètres actuels
   */
  getSettings(): OperationModeSettings {
    return { ...this.settings };
  }
  
  /**
   * Met à jour les paramètres
   */
  updateSettings(newSettings: Partial<OperationModeSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
  }
  
  /**
   * Réinitialise les paramètres aux valeurs par défaut
   */
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
  }
  
  /**
   * Gère les erreurs de connexion Notion
   * Peut basculer automatiquement en mode démo selon les paramètres
   */
  handleConnectionError(error: Error, context: string = 'Opération Notion'): void {
    this.lastError = error;
    this.consecutiveFailures++;
    
    console.warn(`🚨 Erreur de connexion Notion (${this.consecutiveFailures} échecs)`, error);
    
    // Si le mode automatique est activé et qu'on est en mode réel
    if (this.settings.autoSwitch && this.isRealMode() && this.consecutiveFailures >= 2) {
      const reason = `Échec de connexion: ${error.message || 'Erreur non spécifiée'}`;
      this.switchToMode(OperationMode.DEMO, reason);
    }
  }
  
  /**
   * Réinitialise le compteur d'échecs suite à une opération réussie
   */
  handleSuccessfulOperation(): void {
    if (this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0;
      this.lastError = null;
      console.log('✅ Réinitialisation du compteur d\'échecs suite à une opération réussie');
    }
  }
  
  /**
   * Enregistre un écouteur pour les changements de mode
   */
  subscribe(listener: Function): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Obtient la raison du dernier changement de mode
   */
  getSwitchReason(): string | null {
    return this.switchReason;
  }
  
  /**
   * Obtient la dernière erreur enregistrée
   */
  getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Obtient le nombre d'échecs consécutifs
   */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
  
  /**
   * Bascule entre les modes réel et démo
   */
  toggle(): OperationMode {
    const newMode = this.isRealMode() ? OperationMode.DEMO : OperationMode.REAL;
    this.switchToMode(newMode, 'Basculement manuel');
    return this.mode;
  }
  
  /**
   * Effectue le changement de mode proprement dit
   */
  private switchToMode(newMode: OperationMode, reason: string): void {
    // Ne rien faire si on est déjà dans ce mode
    if (this.mode === newMode) return;
    
    const previousMode = this.mode;
    this.mode = newMode;
    this.switchReason = reason;
    
    console.log(`🔄 Changement de mode: ${previousMode} -> ${newMode} (${reason})`);
    
    // Notification si activée
    if (this.settings.notifyOnSwitch) {
      if (newMode === OperationMode.DEMO) {
        toast.info('Mode démonstration activé', {
          description: reason,
          duration: 4000
        });
      } else if (newMode === OperationMode.REAL) {
        toast.success('Mode réel activé', {
          description: 'Connexion directe à Notion',
          duration: 3000
        });
      }
    }
    
    // Persister si activé
    if (this.settings.persistMode) {
      this.saveToStorage();
    }
    
    // Notifier les écouteurs
    this.notifyListeners();
  }
  
  /**
   * Charge la configuration depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(MODE_STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Restaurer le mode
        if (data.mode && Object.values(OperationMode).includes(data.mode)) {
          this.mode = data.mode;
        }
        
        // Restaurer les paramètres
        if (data.settings) {
          this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
        }
        
        console.log(`🔄 Mode chargé depuis localStorage: ${this.mode}`);
      }
    } catch (e) {
      console.error('Erreur lors du chargement du mode depuis localStorage', e);
    }
  }
  
  /**
   * Sauvegarde la configuration dans localStorage
   */
  private saveToStorage(): void {
    try {
      const dataToStore = {
        mode: this.mode,
        settings: this.settings
      };
      
      localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du mode dans localStorage', e);
    }
  }
  
  /**
   * Notifie tous les écouteurs d'un changement de mode
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.mode);
      } catch (e) {
        console.error('Erreur dans un écouteur de mode', e);
      }
    });
  }
}

// Créer et exporter l'instance unique du service
export const operationMode = new OperationModeService();

// Exporter une fonction utilitaire pour les composants React
export function useOperationMode() {
  const [mode, setMode] = React.useState<OperationMode>(operationMode.getMode());
  
  React.useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = operationMode.subscribe((newMode: OperationMode) => {
      setMode(newMode);
    });
    
    // Se désabonner au démontage
    return unsubscribe;
  }, []);
  
  return {
    mode,
    isDemoMode: operationMode.isDemoMode(),
    isRealMode: operationMode.isRealMode(),
    enableDemoMode: operationMode.enableDemoMode.bind(operationMode),
    enableRealMode: operationMode.enableRealMode.bind(operationMode),
    toggle: operationMode.toggle.bind(operationMode),
    settings: operationMode.getSettings(),
    updateSettings: operationMode.updateSettings.bind(operationMode),
    switchReason: operationMode.getSwitchReason(),
    lastError: operationMode.getLastError(),
    failures: operationMode.getConsecutiveFailures()
  };
}
