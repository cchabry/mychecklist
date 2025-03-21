import { STORAGE_KEYS } from './config';

/**
 * Service de gestion du mode mock pour Notion
 */

// Variable d'état du mode mock (singleton)
let _isMockModeActive = false;
let _isForcedRealMode = false;
let _previousMockState = false;

export const mockMode = {
  isActive: () => {
    // Si on est en mode forcé réel, retourner false
    if (_isForcedRealMode) return false;
    
    // Sinon, retourner l'état actuel du mode mock
    return _isMockModeActive;
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
      _isForcedRealMode = false;
      
      // Si nécessaire, restaurer l'état précédent
      if (_previousMockState && !_isMockModeActive) {
        mockMode.activate();
      }
    };
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
    return true;
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
