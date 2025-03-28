
/**
 * Service de gestion du mode de fonctionnement
 * 
 * Ce service gère le mode de fonctionnement de l'application :
 * - Mode réel : utilise l'API Notion
 * - Mode démonstration : utilise des données simulées localement
 */

import { OperationMode, OperationModeState } from '@/types/operation';
import { notionClient } from '../notion/notionClient';
import { Subject } from 'rxjs';

// Clé de stockage local
const STORAGE_KEY = 'operation_mode';

/**
 * Service pour gérer le mode d'opération de l'application
 */
export class OperationModeService {
  // État interne
  private state: OperationModeState;
  
  // Observable pour les changements d'état
  private stateChange$ = new Subject<OperationModeState>();
  
  constructor() {
    // Initialiser avec l'état par défaut ou celui stocké
    this.state = this.loadState() || {
      mode: 'demo',
      source: 'default', 
      timestamp: new Date().toISOString()
    };
    
    // Appliquer l'état initial
    this.applyState(this.state);
  }
  
  /**
   * Retourne le mode actuel
   */
  getMode(): OperationMode {
    return this.state.mode;
  }
  
  /**
   * Retourne l'état complet
   */
  getState(): OperationModeState {
    return { ...this.state };
  }
  
  /**
   * Active le mode réel (API Notion)
   */
  enableRealMode() {
    this.updateState({
      mode: 'real',
      source: 'manual',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Active le mode démonstration (données simulées)
   */
  enableDemoMode(reason: string) {
    this.updateState({
      mode: 'demo',
      reason,
      source: 'manual',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * S'abonne aux changements d'état
   * 
   * @param callback Fonction appelée à chaque changement d'état
   * @returns Fonction pour se désabonner
   */
  subscribe(callback: (state: OperationModeState) => void) {
    const subscription = this.stateChange$.subscribe(callback);
    return () => subscription.unsubscribe();
  }
  
  /**
   * Réinitialise le service à son état par défaut
   */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      mode: 'demo',
      source: 'default',
      timestamp: new Date().toISOString()
    };
    this.applyState(this.state);
  }
  
  /**
   * Met à jour l'état et notifie les abonnés
   */
  private updateState(newState: Partial<OperationModeState>) {
    this.state = {
      ...this.state,
      ...newState
    };
    
    this.saveState();
    this.applyState(this.state);
    this.stateChange$.next(this.state);
  }
  
  /**
   * Applique l'état actuel aux services dépendants
   */
  private applyState(state: OperationModeState) {
    if (state.mode === 'demo') {
      notionClient.setMockMode(true);
    } else {
      notionClient.setMockMode(false);
    }
  }
  
  /**
   * Sauvegarde l'état dans le stockage local
   */
  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode:', error);
    }
  }
  
  /**
   * Charge l'état depuis le stockage local
   */
  private loadState(): OperationModeState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors du chargement du mode:', error);
      return null;
    }
  }
  
  /**
   * Détecte automatiquement le mode en fonction de l'environnement
   */
  detectEnvironment() {
    // Détecter l'environnement de développement
    const isDev = process.env.NODE_ENV === 'development';
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    // Si on est en développement local et qu'aucun mode n'a été choisi explicitement
    if (isDev && isLocalhost && this.state.source === 'default') {
      this.updateState({
        mode: 'demo',
        source: 'auto',
        reason: 'Environnement de développement local détecté'
      });
    }
  }
}

// Créer et exporter une instance singleton
export const operationModeService = new OperationModeService();

// Export par défaut
export default operationModeService;
