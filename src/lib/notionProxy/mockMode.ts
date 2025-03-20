
import { STORAGE_KEYS } from './config';
import { mockNotionResponse } from './mockData';
import { mockNotionResponseV2 } from './mockDataV2';

/**
 * Mode de fonctionnement du mock Notion
 */
export enum MockVersion {
  DISABLED = 'disabled',  // Mode réel (pas de mock)
  V1 = 'v1',              // Mock original
  V2 = 'v2'               // Mock conforme au Brief v2
}

/**
 * Gestion unifiée du mode mock pour les requêtes Notion.
 * Prend en charge les versions v1 (original) et v2 (Brief v2)
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive: (): boolean => {
    return mockMode.getActiveVersion() !== MockVersion.DISABLED;
  },

  /**
   * Détermine quelle version du mock est active
   */
  getActiveVersion: (): MockVersion => {
    // Vérifier les paramètres d'URL en premier
    const urlParams = new URLSearchParams(window.location.search);
    
    // Vérifier si mode réel est forcé
    if (localStorage.getItem('notion_force_real') === 'true') {
      return MockVersion.DISABLED;
    }
    
    // Vérifier les paramètres spécifiques d'URL
    if (urlParams.has('mockv2') && (urlParams.get('mockv2') === 'true' || urlParams.get('mockv2') === '1')) {
      return MockVersion.V2;
    }
    
    if (urlParams.has('mock') && (urlParams.get('mock') === 'true' || urlParams.get('mock') === '1')) {
      return MockVersion.V1;
    }
    
    // Fallback sur le localStorage
    const storedMode = localStorage.getItem(STORAGE_KEYS.MOCK_MODE);
    if (storedMode === MockVersion.V1) return MockVersion.V1;
    if (storedMode === MockVersion.V2) return MockVersion.V2;
    
    return MockVersion.DISABLED;
  },
  
  /**
   * Active le mode mock v1 (original)
   */
  activateV1: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, MockVersion.V1);
    localStorage.removeItem('notion_force_real');
  },
  
  /**
   * Active le mode mock v2 (Brief v2)
   */
  activateV2: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, MockVersion.V2);
    localStorage.removeItem('notion_force_real');
  },
  
  /**
   * Désactive tous les modes mock
   */
  deactivate: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
  },
  
  /**
   * Force le mode réel en supprimant tous les drapeaux liés au mode mock
   */
  forceReset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.setItem('notion_force_real', 'true');
    // Nettoyer aussi les erreurs précédentes
    localStorage.removeItem(STORAGE_KEYS.NOTION_ERROR);
  },
  
  /**
   * Vérifie si la version v2 du mock est active
   */
  isV2Active: (): boolean => {
    return mockMode.getActiveVersion() === MockVersion.V2;
  },
  
  /**
   * Vérifie si la version v1 du mock est active
   */
  isV1Active: (): boolean => {
    return mockMode.getActiveVersion() === MockVersion.V1;
  },
  
  /**
   * Obtient la réponse simulée pour une requête à l'API Notion
   * @param endpoint - Point de terminaison de l'API
   * @param method - Méthode HTTP (GET, POST, etc.)
   * @param body - Corps de la requête (optionnel)
   * @returns Réponse simulée au format JSON
   */
  getMockResponse: (endpoint: string, method: string, body?: any): any => {
    // Utiliser mockV2 si cette version est active
    if (mockMode.isV2Active()) {
      console.log(`[MOCK V2] Appel API Notion: ${method} ${endpoint}`);
      return mockNotionResponseV2(endpoint, method, body);
    }
    
    // Sinon utiliser la version originale
    console.log(`[MOCK V1] Appel API Notion: ${method} ${endpoint}`);
    return mockNotionResponse(endpoint, method, body);
  }
};
