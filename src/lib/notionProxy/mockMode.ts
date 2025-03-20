import { STORAGE_KEYS } from './config';
import { mockNotionResponse } from './mockData';

/**
 * Gestion du mode mock pour les requêtes Notion.
 * Le mode mock permet de simuler des réponses de l'API Notion pour le développement et les démonstrations.
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive: (): boolean => {
    // Vérifier les paramètres d'URL en premier
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock')) {
      const mockParam = urlParams.get('mock');
      const shouldActivate = mockParam === 'true' || mockParam === '1';
      
      // Si explicitement demandé dans l'URL, mettre à jour le localStorage
      if (shouldActivate) {
        localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
        return true;
      } else if (mockParam === 'false' || mockParam === '0') {
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        return false;
      }
    }
    
    // Ensuite, vérifier si le mode force_real est actif
    if (localStorage.getItem('notion_force_real') === 'true') {
      return false;
    }
    
    // Fallback sur le localStorage
    return localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true';
  },
  
  /**
   * Active le mode mock
   */
  activate: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
  },
  
  /**
   * Bascule l'état du mode mock
   */
  toggle: (): boolean => {
    const isCurrentlyActive = mockMode.isActive();
    if (isCurrentlyActive) {
      mockMode.deactivate();
    } else {
      mockMode.activate();
    }
    return !isCurrentlyActive;
  },
  
  /**
   * Force le mode réel en supprimant tous les drapeaux liés au mode mock
   */
  forceReset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.setItem('notion_force_real', 'true');
    // Nettoyer aussi les erreurs précédentes
    localStorage.removeItem('notion_last_error');
  },
  
  /**
   * Réinitialise complètement la configuration du mode mock
   */
  reset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.removeItem('notion_force_real');
  },
  
  /**
   * Force temporairement le mode réel pour une seule opération
   */
  temporarilyForceReal: (): (() => void) => {
    const wasActive = mockMode.isActive();
    if (wasActive) {
      localStorage.setItem('temp_was_mock', 'true');
      mockMode.deactivate();
    }
    
    // Retourner une fonction pour restaurer l'état précédent
    return () => {
      if (localStorage.getItem('temp_was_mock') === 'true') {
        mockMode.activate();
        localStorage.removeItem('temp_was_mock');
      }
    };
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal: (): boolean => {
    return localStorage.getItem('temp_was_mock') === 'true';
  },
  
  /**
   * Restaure l'état précédent après avoir forcé temporairement le mode réel
   */
  restoreAfterForceReal: (): void => {
    if (localStorage.getItem('temp_was_mock') === 'true') {
      mockMode.activate();
      localStorage.removeItem('temp_was_mock');
    }
  },
  
  /**
   * Obtient la réponse simulée pour une requête à l'API Notion
   * @param endpoint - Point de terminaison de l'API
   * @param method - Méthode HTTP (GET, POST, etc.)
   * @param body - Corps de la requête (optionnel)
   * @returns Réponse simulée au format JSON
   */
  getMockResponse: (endpoint: string, method: string, body?: any): any => {
    return mockNotionResponse(endpoint, method, body);
  }
};
