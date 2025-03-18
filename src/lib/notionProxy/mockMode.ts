
import { STORAGE_KEYS } from './config';

/**
 * Utility functions for managing the mock mode
 * Used when the API isn't accessible due to CORS or other issues
 */
export const mockMode = {
  isActive: (): boolean => {
    // Vérifier si on est en mode mock (pas de vraie API Notion)
    return localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true';
  },
  
  activate: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    console.log('Mode mock Notion activé');
  },
  
  deactivate: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    console.log('Mode mock Notion désactivé');
  }
};
