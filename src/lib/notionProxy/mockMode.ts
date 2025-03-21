
import { STORAGE_KEYS } from './config';

/**
 * Service de gestion du mode mock pour Notion
 */

// Variables d'état du mode mock (singleton)
let _isMockModeActive = false;
let _isForcedRealMode = false;
let _previousMockState = false;

// Nouvelles variables pour la configuration avancée du mode mock
let _scenario = 'standard';
let _delay = 300;
let _errorRate = 0;

export const mockMode = {
  isActive: () => {
    // Si on est en mode forcé réel, retourner false
    if (_isForcedRealMode) return false;
    
    // Sinon, retourner l'état actuel du mode mock
    return _isMockModeActive;
  },
  
  /**
   * Vérifie si le mode est temporairement forcé en mode réel
   */
  isTemporarilyForcedReal: () => {
    return _isForcedRealMode;
  },
  
  /**
   * Active le mode mock
   */
  activate: () => {
    console.log('🔄 Activation du mode mock pour Notion');
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    _isMockModeActive = true;
    return true;
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate: () => {
    console.log('🔄 Désactivation du mode mock pour Notion');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    _isMockModeActive = false;
    return true;
  },
  
  /**
   * Vérifie et restaure l'état du mode mock depuis le localStorage
   */
  checkAndRestore: () => {
    const storedMockMode = localStorage.getItem(STORAGE_KEYS.MOCK_MODE);
    const shouldBeMockMode = storedMockMode === 'true';
    
    // Mettre à jour l'état interne
    _isMockModeActive = shouldBeMockMode;
    
    // Si on est dans un état inapproprié, restaurer
    const currentMockState = mockMode.isActive();
    if (currentMockState !== shouldBeMockMode && !_isForcedRealMode) {
      if (shouldBeMockMode) {
        mockMode.activate();
      } else {
        mockMode.deactivate();
      }
    }
    
    return mockMode.isActive();
  },
  
  /**
   * Bascule l'état du mode mock
   */
  toggle: () => {
    if (mockMode.isActive()) {
      return mockMode.deactivate();
    } else {
      return mockMode.activate();
    }
  },
  
  /**
   * Force la désactivation du mode mock temporairement
   * pour une opération spécifique
   */
  temporarilyForceReal: () => {
    // Sauvegarder l'état actuel
    _previousMockState = _isMockModeActive;
    
    // Forcer le mode réel
    _isForcedRealMode = true;
    
    // Retourner une fonction pour restaurer l'état
    return () => {
      mockMode.restoreAfterForceReal();
    };
  },
  
  /**
   * Restaure l'état après avoir forcé le mode réel
   */
  restoreAfterForceReal: () => {
    _isForcedRealMode = false;
    
    // Si nécessaire, restaurer l'état précédent
    if (_previousMockState && !_isMockModeActive) {
      mockMode.activate();
    }
  },
  
  /**
   * Force une réinitialisation complète du mode mock
   * (utilisé principalement pour les cas de diagnostic)
   */
  forceReset: () => {
    console.log('🔄 Réinitialisation forcée du mode mock');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    _isMockModeActive = false;
    _isForcedRealMode = false;
    _previousMockState = false;
    
    // Réinitialiser les paramètres avancés
    _scenario = 'standard';
    _delay = 300;
    _errorRate = 0;
    
    return true;
  },
  
  /**
   * Obtient le scénario actuel
   */
  getScenario: () => {
    return _scenario;
  },
  
  /**
   * Définit le scénario
   */
  setScenario: (scenario) => {
    _scenario = scenario;
    return true;
  },
  
  /**
   * Obtient le délai de simulation
   */
  getDelay: () => {
    return _delay;
  },
  
  /**
   * Définit le délai de simulation
   */
  setDelay: (delay) => {
    _delay = delay;
    return true;
  },
  
  /**
   * Obtient le taux d'erreur
   */
  getErrorRate: () => {
    return _errorRate;
  },
  
  /**
   * Définit le taux d'erreur
   */
  setErrorRate: (rate) => {
    _errorRate = rate;
    return true;
  },
  
  /**
   * Applique un délai simulé basé sur la configuration
   */
  applySimulatedDelay: async () => {
    if (_delay > 0) {
      await new Promise(resolve => setTimeout(resolve, _delay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée
   * basé sur le taux d'erreur configuré
   */
  shouldSimulateError: () => {
    if (_errorRate <= 0) return false;
    return Math.random() * 100 < _errorRate;
  }
};

// Initialiser l'état du mode mock au démarrage
(() => {
  try {
    mockMode.checkAndRestore();
  } catch (e) {
    // Ignorer les erreurs lors de l'initialisation
    console.error("Erreur lors de l'initialisation du mode mock:", e);
  }
})();
