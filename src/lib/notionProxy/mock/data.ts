
/**
 * Générateur de réponses mock pour l'API Notion
 */

import { mockMode } from '../mockMode';

/**
 * Génère une réponse simulée pour une requête Notion
 */
export function getMockData(endpoint: string, method: string, body: any, scenario: string = 'standard') {
  // Simuler un délai aléatoire
  const delay = mockMode.getDelay();
  
  // Simuler des erreurs aléatoires selon le taux configuré
  const errorRate = mockMode.getErrorRate();
  if (Math.random() * 100 < errorRate) {
    throw new Error(`Erreur simulée (${scenario}, taux: ${errorRate}%)`);
  }
  
  // Construire une réponse de base
  const response = {
    id: `mock-id-${Date.now()}`,
    created_time: new Date().toISOString(),
    last_edited_time: new Date().toISOString(),
  };
  
  // Réponses spécifiques selon le endpoint et la méthode
  if (endpoint.includes('/v1/users/me')) {
    return {
      ...response,
      name: 'Utilisateur Test',
      avatar_url: null,
      type: 'person',
      person: {},
    };
  }
  
  if (endpoint.includes('/v1/databases')) {
    if (method === 'GET') {
      return {
        ...response,
        title: [{ plain_text: 'Base de données de test', type: 'text' }],
        properties: {
          Name: { id: 'title', type: 'title', title: {} },
          Status: { id: 'status', type: 'select', select: { options: [] } },
          Date: { id: 'date', type: 'date', date: {} },
        },
      };
    }
    
    if (method === 'POST' && endpoint.includes('/query')) {
      return {
        ...response,
        results: Array(10).fill(null).map((_, i) => ({
          id: `mock-page-${i}`,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
          parent: { database_id: body.database_id || 'mock-db' },
          properties: {
            Name: { 
              id: 'title', 
              type: 'title', 
              title: [{ plain_text: `Page de test ${i+1}`, type: 'text' }] 
            },
            Status: { 
              id: 'status', 
              type: 'select', 
              select: { name: i % 3 === 0 ? 'Complété' : 'En cours' } 
            },
          }
        })),
        has_more: false,
        next_cursor: null,
      };
    }
  }
  
  if (endpoint.includes('/v1/pages')) {
    if (method === 'GET') {
      return {
        ...response,
        parent: { database_id: 'mock-db' },
        properties: {
          Name: { 
            id: 'title', 
            type: 'title', 
            title: [{ plain_text: 'Page détaillée', type: 'text' }] 
          },
          Description: {
            id: 'desc',
            type: 'rich_text',
            rich_text: [{ plain_text: 'Description mock', type: 'text' }]
          }
        }
      };
    }
    
    if (method === 'POST' || method === 'PATCH') {
      return {
        ...response,
        object: 'page',
        url: 'https://www.notion.so/mock-page'
      };
    }
  }
  
  // Réponse par défaut
  return {
    ...response,
    object: 'mock',
    mock: true,
    message: 'Réponse simulée'
  };
}

/**
 * Fonctions utilitaires pour le mode mock
 */
export const mockUtils = {
  /**
   * Applique un délai simulé pour les opérations mock
   */
  applySimulatedDelay: async (): Promise<void> => {
    const delay = mockMode.getDelay();
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée
   */
  shouldSimulateError: (): boolean => {
    const errorRate = mockMode.getErrorRate();
    return Math.random() * 100 < errorRate;
  },
  
  /**
   * Désactive temporairement le mode mock pour une opération
   * particulière, tout en conservant l'état pour le restaurer ensuite
   */
  temporarilyForceReal: (): boolean => {
    const wasMock = mockMode.isActive();
    if (wasMock) {
      mockMode.deactivate();
    }
    return wasMock;
  },
  
  /**
   * Restaure le mode mock si nécessaire
   */
  restoreAfterForceReal: (wasMock: boolean): void => {
    if (wasMock) {
      mockMode.activate();
    }
  },
  
  /**
   * Vérifie si le mode mock est temporairement forcé en mode réel
   */
  isTemporarilyForcedReal: (wasMock: boolean): boolean => {
    return wasMock && !mockMode.isActive();
  }
};

/**
 * Fonction pour générer une réponse mock pour une requête Notion
 */
export function mockNotionResponse(endpoint: string, method = 'GET', body: any) {
  return getMockData(endpoint, method, body, mockMode.getScenario());
}
