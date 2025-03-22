
/**
 * Module de gestion du mode mock
 */

import { mockState } from './state';
import { getMockData } from './data';

// Valeurs de configuration
let _getDelay = () => mockState.getConfig().delay;
let _getScenario = () => mockState.getConfig().scenario;
let _getErrorRate = () => mockState.getConfig().errorRate;

// Raccourcis pour éviter des appels répétés
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   * @returns {boolean} true si le mode mock est actif, false sinon
   */
  isActive: function() {
    return mockState.isActive();
  },
  
  /**
   * Active le mode mock
   */
  activate: () => mockState.setActive(true),
  
  /**
   * Désactive le mode mock
   */
  deactivate: () => mockState.setActive(false),
  
  /**
   * Bascule l'état du mode mock
   * @returns {boolean} Nouvel état (true = activé, false = désactivé)
   */
  toggle: () => {
    const newState = !mockState.isActive();
    mockState.setActive(newState);
    return newState;
  },
  
  /**
   * Force la réinitialisation du mode mock
   */
  forceReset: () => {
    mockState.setActive(false);
    mockState.resetConfig();
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent: () => mockState.isPermanent(),
  
  /**
   * Définit si le mode mock est permanent
   */
  setPermanent: (permanent: boolean) => mockState.setPermanent(permanent),
  
  /**
   * Récupère le délai de simulation
   */
  getDelay: () => _getDelay(),
  
  /**
   * Définit le délai de simulation
   */
  setDelay: (delay: number) => {
    mockState.updateConfig({ delay });
  },
  
  /**
   * Récupère le scénario actif
   */
  getScenario: () => _getScenario(),
  
  /**
   * Définit le scénario actif
   */
  setScenario: (scenario: string) => {
    mockState.updateConfig({ scenario });
  },
  
  /**
   * Récupère le taux d'erreur
   */
  getErrorRate: () => _getErrorRate(),
  
  /**
   * Définit le taux d'erreur
   */
  setErrorRate: (errorRate: number) => {
    mockState.updateConfig({ errorRate });
  },
  
  /**
   * Génère une réponse simulée pour une requête Notion
   */
  getMockResponse: (endpoint: string, method: string, body: any) => {
    return getMockData(endpoint, method, body, _getScenario());
  }
};

// Interface publique
export type { MockConfig } from './state';
