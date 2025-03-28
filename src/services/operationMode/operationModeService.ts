
/**
 * Service de gestion du mode opérationnel (démo/réel)
 * 
 * Ce service permet de basculer entre le mode démo (données simulées)
 * et le mode réel (données provenant de l'API Notion).
 * 
 * L'état est persisté dans le localStorage pour conserver le mode
 * même après un rechargement de la page.
 */

import { BehaviorSubject } from 'rxjs';
import { notionClient } from '../notion/notionClient';

/**
 * Type de mode opérationnel
 */
export type OperationModeType = 'demo' | 'real';

/**
 * Interface pour l'état du mode opérationnel
 */
export interface OperationModeState {
  /** Mode actuel (démo ou réel) */
  mode: OperationModeType;
  /** Indique si l'application est en mode démo */
  isDemoMode: boolean;
  /** Raison du dernier changement de mode */
  reason?: string;
}

/**
 * Service de gestion du mode opérationnel
 */
class OperationModeService {
  /** Clé pour stocker l'état dans le localStorage */
  private readonly STORAGE_KEY = 'operationModeState';
  
  /** État actuel du mode opérationnel */
  private state: OperationModeState = { 
    mode: 'real', 
    isDemoMode: false 
  };
  
  /** Subject RxJS pour notifier les changements d'état */
  private stateSubject = new BehaviorSubject<OperationModeState>(this.state);
  
  /** Observable pour s'abonner aux changements d'état */
  public state$ = this.stateSubject.asObservable();
  
  constructor() {
    // Charger l'état depuis le localStorage lors de la création du service
    this._loadState();
  }
  
  /**
   * Obtient le mode actuel
   * @returns Le mode actuel (demo ou real)
   */
  getMode(): OperationModeType {
    return this.state.mode;
  }
  
  /**
   * Obtient l'état complet actuel
   * @returns L'état complet du mode d'opération
   */
  getState(): OperationModeState {
    return { ...this.state };
  }
  
  /**
   * S'abonne aux changements d'état
   * @param callback Fonction appelée lors d'un changement d'état
   * @returns Fonction pour se désabonner
   */
  subscribe(callback: (state: OperationModeState) => void): () => void {
    const subscription = this.stateSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }
  
  /**
   * Active le mode démo
   * 
   * @param reason Raison du basculement en mode démo
   */
  enableDemoMode(reason: string): void {
    this._enableDemoMode(reason);
  }
  
  /**
   * Active le mode réel
   * 
   * @param reason Raison du basculement en mode réel
   */
  enableRealMode(reason: string): void {
    this._enableRealMode(reason);
  }

  /**
   * Réinitialise le mode à sa valeur par défaut (réel)
   * 
   * @param reason Raison de la réinitialisation
   */
  reset(reason: string = "Réinitialisation du mode"): void {
    this.enableRealMode(reason);
  }
  
  /**
   * Vérifie si l'application est en mode démo
   * 
   * @returns true si l'application est en mode démo
   */
  isDemoMode(): boolean {
    return this.state.isDemoMode;
  }
  
  /**
   * Vérifie si l'application est en mode réel
   * 
   * @returns true si l'application est en mode réel
   */
  isRealMode(): boolean {
    return !this.state.isDemoMode;
  }
  
  /**
   * Méthode privée pour charger l'état depuis le localStorage
   */
  private _loadState(): void {
    try {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      
      if (storedState) {
        const parsed = JSON.parse(storedState);
        this.state = {
          ...parsed,
          mode: parsed.isDemoMode ? 'demo' : 'real'
        };
        this.stateSubject.next(this.state);
        
        // Configurer les services en fonction de l'état chargé
        notionClient.setMockMode(this.state.isDemoMode);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état du mode opérationnel depuis le localStorage', error);
    }
  }
  
  /**
   * Méthode privée pour sauvegarder l'état dans le localStorage
   */
  private _saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.stateSubject.next(this.state);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état du mode opérationnel dans le localStorage', error);
    }
  }

  /**
   * Méthode privée pour configurer le mode démo
   * 
   * @param reason Raison du basculement en mode démo
   */
  private _enableDemoMode(reason: string): void {
    this.state = {
      mode: 'demo',
      isDemoMode: true,
      reason
    };
    
    // Sauvegarder l'état dans localStorage
    this._saveState();
    
    // Configurer les services pour utiliser le mode démo
    notionClient.setMockMode(true);
  }

  /**
   * Méthode privée pour configurer le mode réel
   * 
   * @param reason Raison du basculement en mode réel
   */
  private _enableRealMode(reason: string): void {
    this.state = {
      mode: 'real',
      isDemoMode: false,
      reason
    };
    
    // Sauvegarder l'état dans localStorage
    this._saveState();
    
    // Configurer les services pour utiliser le mode réel
    notionClient.setMockMode(false);
  }
}

// Créer et exporter une instance singleton
export const operationModeService = new OperationModeService();

// Export par défaut
export default operationModeService;
