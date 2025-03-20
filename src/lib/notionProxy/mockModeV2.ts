import { STORAGE_KEYS } from './config';
import { mockNotionResponseV2 } from './mockDataV2';
import { mockNotionResponse } from './mockData';

/**
 * Gestion du mode mock v2 pour les requêtes Notion.
 * Cette version est alignée avec le Brief v2 et propose une structure de données 
 * plus complète selon le nouveau modèle.
 */
export const mockModeV2 = {
  /**
   * Vérifie si le mode mock v2 est actif
   */
  isActive: (): boolean => {
    // Vérifier si le mode v2 est explicitement activé
    if (localStorage.getItem(STORAGE_KEYS.MOCK_MODE_V2) === 'true') {
      return true;
    }
    
    // Sinon, vérifier les paramètres d'URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mockv2')) {
      const mockParam = urlParams.get('mockv2');
      if (mockParam === 'true' || mockParam === '1') {
        localStorage.setItem(STORAGE_KEYS.MOCK_MODE_V2, 'true');
        return true;
      }
    }
    
    return false;
  },
  
  /**
   * Active le mode mock v2
   */
  activate: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE_V2, 'true');
    // Désactiver l'ancien mode mock pour éviter les conflits
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
  },
  
  /**
   * Désactive le mode mock v2
   */
  deactivate: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE_V2);
  },
  
  /**
   * Bascule l'état du mode mock v2
   */
  toggle: (): boolean => {
    const isCurrentlyActive = mockModeV2.isActive();
    if (isCurrentlyActive) {
      mockModeV2.deactivate();
    } else {
      mockModeV2.activate();
    }
    return !isCurrentlyActive;
  },
  
  /**
   * Réinitialise tous les modes mock
   * Force le retour au mode réel
   */
  forceReset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE_V2);
    localStorage.setItem('notion_force_real', 'true');
    // Nettoyer aussi les erreurs précédentes
    localStorage.removeItem('notion_last_error');
  },
  
  /**
   * Obtient la réponse simulée pour une requête à l'API Notion (version v2)
   * @param endpoint - Point de terminaison de l'API
   * @param method - Méthode HTTP (GET, POST, etc.)
   * @param body - Corps de la requête (optionnel)
   * @returns Réponse simulée au format JSON conforme au Brief v2
   */
  getMockResponse: (endpoint: string, method: string, body?: any): any => {
    // Pour l'instant, on peut réutiliser les mêmes données mock
    // mais à l'avenir, nous implémenterons des données spécifiques à v2
    return mockNotionResponseV2 ? mockNotionResponseV2(endpoint, method, body) : mockNotionResponse(endpoint, method, body);
  }
};
