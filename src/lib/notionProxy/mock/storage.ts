
import { mockState, MockConfig } from './state';

/**
 * Clés de stockage pour le mode mock
 */
const STORAGE_KEYS = {
  MOCK_MODE: 'notion_mock_mode',
  MOCK_CONFIG: 'notion_mock_config'
};

/**
 * Module de gestion du stockage pour le mode mock
 */
export const mockStorage = {
  /**
   * Charge l'état du mode mock depuis le localStorage
   */
  loadFromStorage(): void {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEYS.MOCK_MODE);
      
      if (storedMode === 'true') {
        mockState.setActive(true);
        console.log('✅ Mode mock chargé depuis localStorage (activé)');
      } else if (storedMode === 'true_permanent') {
        mockState.setActive(true);
        mockState.setPermanent(true);
        console.log('✅ Mode mock permanent chargé depuis localStorage');
      }
      
      // Charger la configuration
      const storedConfig = localStorage.getItem(STORAGE_KEYS.MOCK_CONFIG);
      if (storedConfig) {
        try {
          const config = JSON.parse(storedConfig);
          mockState.updateConfig(config);
          console.log('✅ Configuration mock chargée depuis localStorage');
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      }
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Sauvegarde l'état du mode mock dans le localStorage
   */
  saveToStorage(): void {
    try {
      if (mockState.isPermanent()) {
        localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true_permanent');
      } else {
        localStorage.setItem(STORAGE_KEYS.MOCK_MODE, mockState.isActive() ? 'true' : 'false');
      }
      
      // Sauvegarder la configuration
      localStorage.setItem(STORAGE_KEYS.MOCK_CONFIG, JSON.stringify(mockState.getConfig()));
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Supprime l'état du mode mock du localStorage
   */
  clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      localStorage.removeItem(STORAGE_KEYS.MOCK_CONFIG);
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  }
};
