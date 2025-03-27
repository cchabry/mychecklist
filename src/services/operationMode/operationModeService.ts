
import { OperationModeService, OperationModeState, OperationModeType } from '@/types/operation/operationMode';
import { OPERATION_MODE_RESET } from '@/constants/errorMessages';
import { STORAGE_KEYS } from '@/constants/appConstants';

/**
 * Valeur par défaut du mode opérationnel
 * En environnement de production: 'real'
 * En environnement de développement: 'demo'
 */
const DEFAULT_MODE: OperationModeType = 
  process.env.NODE_ENV === 'production' ? 'real' : 'demo';

/**
 * Service de gestion du mode opérationnel (réel vs démo)
 * 
 * Ce service permet de contrôler si l'application utilise:
 * - L'API Notion réelle (mode 'real')
 * - Des données simulées (mode 'demo')
 * 
 * Il maintient l'état global du mode et notifie les abonnés des changements.
 */
class OperationModeServiceImpl implements OperationModeService {
  private state: OperationModeState;
  private listeners: Array<(state: OperationModeState) => void> = [];
  
  constructor() {
    // Récupération du mode depuis le localStorage
    const savedState = this.getSavedState();
    
    this.state = savedState || {
      mode: DEFAULT_MODE,
      timestamp: Date.now(),
      source: 'system'
    };
    
    console.log(`[OperationMode] Initialisation en mode: ${this.state.mode}`);
  }
  
  private getSavedState(): OperationModeState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATION_MODE);
      if (saved) {
        try {
          return JSON.parse(saved) as OperationModeState;
        } catch (error) {
          console.error('Erreur lors de la récupération du mode opérationnel :', error);
          // Si l'analyse JSON échoue, supprimer la valeur corrompue
          localStorage.removeItem(STORAGE_KEYS.OPERATION_MODE);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès au localStorage :', error);
    }
    return null;
  }
  
  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OPERATION_MODE, JSON.stringify(this.state));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode opérationnel :', error);
    }
  }
  
  private updateState(newState: Partial<OperationModeState>): void {
    this.state = { ...this.state, ...newState, timestamp: Date.now() };
    this.saveState();
    this.notifyListeners();
    
    // Synchroniser avec Notion client si nécessaire
    this.syncWithNotionClient();
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  /**
   * Synchronise le mode opérationnel avec le client Notion
   * Cette méthode est utilisée pour s'assurer que le client Notion
   * utilise le même mode que le service de mode opérationnel
   */
  private syncWithNotionClient(): void {
    // Import dynamique pour éviter les dépendances cycliques
    import('@/services/notion/notionClient').then(({ notionClient }) => {
      if (this.isDemoMode()) {
        notionClient.setMockMode(true);
      } else {
        notionClient.setMockMode(false);
      }
    }).catch(err => {
      console.error('Erreur lors de la synchronisation avec le client Notion:', err);
    });
  }
  
  // Méthodes publiques
  getMode(): OperationModeType {
    return this.state.mode;
  }
  
  getState(): OperationModeState {
    return { ...this.state };
  }
  
  enableRealMode(reason?: string): void {
    if (this.state.mode === 'real') return;
    
    console.log(`[OperationMode] Activation du mode réel${reason ? ` (${reason})` : ''}`);
    this.updateState({
      mode: 'real',
      reason,
      source: reason ? 'user' : 'system'
    });
  }
  
  enableDemoMode(reason?: string): void {
    if (this.state.mode === 'demo') return;
    
    console.log(`[OperationMode] Activation du mode démo${reason ? ` (${reason})` : ''}`);
    this.updateState({
      mode: 'demo',
      reason,
      source: reason ? 'user' : 'system'
    });
  }
  
  reset(): void {
    console.log(`[OperationMode] Réinitialisation au mode par défaut: ${DEFAULT_MODE}`);
    // Conserver la raison existante lors d'une réinitialisation
    const currentReason = this.state.reason || OPERATION_MODE_RESET;
    this.updateState({
      mode: DEFAULT_MODE,
      reason: currentReason,
      source: 'system'
    });
  }
  
  isDemoMode(): boolean {
    return this.state.mode === 'demo';
  }
  
  isRealMode(): boolean {
    return this.state.mode === 'real';
  }
  
  subscribe(listener: (state: OperationModeState) => void): () => void {
    this.listeners.push(listener);
    
    // Appeler immédiatement le listener avec l'état actuel
    listener(this.state);
    
    // Retourne une fonction de désinscription
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Créer une instance unique du service
export const operationModeService = new OperationModeServiceImpl();
