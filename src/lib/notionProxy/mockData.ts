/**
 * Données de mock pour l'API Notion - Version Brief v2
 * 
 * Ce fichier contient des simulateurs de réponses pour l'API Notion
 * permettant de tester et développer sans connexion à Notion.
 * 
 * Les données sont conformes au Brief v2 et incluent plusieurs
 * scénarios (standard, vide, erreur, grand volume).
 */

import { mockMode } from './mockMode';

/**
 * Simule une réponse de l'API Notion
 */
export const mockNotionResponse = (endpoint: string, method: string, body: any) => {
  console.log(`[MOCK v2] Appel API Notion: ${method} ${endpoint}`);
  
  // Vérifier si on doit simuler un délai
  if (mockMode.shouldSimulateLoadingDelay()) {
    console.log('[MOCK v2] Simulation d\'un délai de chargement');
    // Simuler un délai aléatoire entre 1,5 et 3 secondes
    const delay = 1500 + Math.random() * 1500;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(processNotionRequest(endpoint, method, body));
      }, delay);
    });
  }
  
  // Vérifier si on doit simuler une erreur
  if (mockMode.shouldSimulateError()) {
    console.log('[MOCK v2] Simulation d\'une erreur API');
    const errorTypes = [
      { code: 'validation_error', message: 'Validation error: Les données fournies sont invalides', status: 400 },
      { code: 'unauthorized', message: 'Unauthorized: Token d\'API invalide ou expiré', status: 401 },
      { code: 'restricted_resource', message: 'Restricted resource: Accès refusé à cette ressource', status: 403 },
      { code: 'not_found', message: 'Not found: La ressource demandée n\'existe pas', status: 404 },
      { code: 'rate_limited', message: 'Rate limited: Trop de requêtes, veuillez réessayer plus tard', status: 429 },
      { code: 'internal_server_error', message: 'Internal server error: Une erreur s\'est produite sur le serveur', status: 500 }
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    return {
      object: 'error',
      status: randomError.status,
      code: randomError.code,
      message: randomError.message
    };
  }
  
  return processNotionRequest(endpoint, method, body);
};

/**
 * Traite une requête Notion simulée en fonction du scénario sélectionné
 */
const processNotionRequest = (endpoint: string, method: string, body: any) => {
  const scenario = mockMode.getScenario();
  console.log(`[MOCK v2] Utilisation du scénario: ${scenario}`);
  
  if (scenario === 'empty') {
    return mockEmptyDataScenario(endpoint, method, body);
  }
  
  if (scenario === 'large') {
    return mockLargeVolumeScenario(endpoint, method, body);
  }
  
  // Scénario standard par défaut
  if (endpoint.startsWith('/users')) {
    return mockNotionUsers(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/databases')) {
    return mockNotionDatabases(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/pages')) {
    return mockNotionPages(endpoint, method, body);
  }
  
  console.warn(`[MOCK v2] Endpoint non géré: ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint non géré: ${endpoint}`
  };
};

/**
 * Scénario de données vides
 */
const mockEmptyDataScenario = (endpoint: string, method: string, body: any) => {
  if (endpoint === '/users') {
    return {
      object: 'list',
      results: [],
      next_cursor: null,
      has_more: false
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query')) {
    return {
      object: 'list',
      results: [],
      next_cursor: null,
      has_more: false
    };
  }
  
  // Pour les autres endpoints, retourner des données minimales
  return {
    object: 'list',
    results: [],
    next_cursor: null,
    has_more: false
  };
};

/**
 * Scénario de grand volume de données
 */
const mockLargeVolumeScenario = (endpoint: string, method: string, body: any) => {
  if (endpoint === '/users') {
    return {
      object: 'list',
      results: Array(50).fill(null).map((_, index) => ({
        object: 'user',
        id: `user-id-${index}`,
        type: 'person',
        name: `User ${index}`,
        avatar_url: null,
        person: {
          email: `user${index}@example.com`
        }
      })),
      next_cursor: 'next_page_cursor',
      has_more: true
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query')) {
    return {
      object: 'list',
      results: Array(100).fill(null).map((_, index) => ({
        object: 'page',
        id: `large-page-id-${index}`,
        created_time: new Date().toISOString(),
        last_edited_time: new Date().toISOString(),
        properties: {
          Name: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: `Large Dataset Item ${index}`,
                  link: null
                },
                plain_text: `Large Dataset Item ${index}`,
                href: null
              }
            ]
          }
        }
      })),
      next_cursor: 'next_page_cursor',
      has_more: true
    };
  }
  
  // Rediriger vers les réponses standard pour les autres endpoints
  if (endpoint.startsWith('/users')) {
    return mockNotionUsers(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/databases')) {
    return mockNotionDatabases(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/pages')) {
    return mockNotionPages(endpoint, method, body);
  }
  
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint non géré dans le scénario grand volume: ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Users
 */
const mockNotionUsers = (endpoint: string, method: string, body: any) => {
  if (endpoint === '/users' && method === 'GET') {
    console.log('[MOCK] Retourne une liste d\'utilisateurs mock');
    return {
      object: 'list',
      results: [
        {
          object: 'user',
          id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
          type: 'person',
          name: 'Mock User',
          avatar_url: null,
          person: {
            email: 'mock.user@example.com'
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  if (endpoint === '/users/me' && method === 'GET') {
    console.log('[MOCK] Retourne l\'utilisateur courant (mock)');
    return {
      object: 'user',
      id: 'f7a74990-c99c-479a-a2df-f7a53949940b',
      type: 'person',
      name: 'Mock User',
      avatar_url: null,
      person: {
        email: 'mock.user@example.com'
      }
    };
  }
  
  console.warn(`[MOCK] Endpoint Users non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Users non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Databases
 */
const mockNotionDatabases = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/databases/') && method === 'GET') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne la database mock avec l'ID ${databaseId}`);
    return {
      object: 'database',
      id: databaseId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      title: [
        {
          type: 'text',
          text: {
            content: 'Mock Database',
            link: null
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default'
          },
          plain_text: 'Mock Database',
          href: null
        }
      ],
      properties: {
        Name: {
          id: 'title',
          name: 'Name',
          type: 'title',
          title: {}
        }
      }
    };
  }
  
  if (endpoint.startsWith('/databases/') && endpoint.endsWith('/query') && method === 'POST') {
    const databaseId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne les résultats de la query pour la database ${databaseId}`);
    return {
      object: 'list',
      results: [
        {
          object: 'page',
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          created_time: '2023-08-01T12:00:00.000Z',
          last_edited_time: '2023-08-01T12:00:00.000Z',
          properties: {
            Name: {
              id: 'title',
              name: 'Name',
              type: 'title',
              title: [
                {
                  type: 'text',
                  text: {
                    content: 'Mock Page',
                    link: null
                  },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default'
                  },
                  plain_text: 'Mock Page',
                  href: null
                }
              ]
            }
          }
        }
      ],
      next_cursor: null,
      has_more: false
    };
  }
  
  console.warn(`[MOCK] Endpoint Databases non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Databases non géré: ${method} ${endpoint}`
  };
};

/**
 * Simule les réponses pour l'API Pages
 */
const mockNotionPages = (endpoint: string, method: string, body: any) => {
  if (endpoint.startsWith('/pages/') && method === 'GET') {
    const pageId = endpoint.split('/')[2];
    console.log(`[MOCK] Retourne la page mock avec l'ID ${pageId}`);
    return {
      object: 'page',
      id: pageId,
      created_time: '2023-08-01T12:00:00.000Z',
      last_edited_time: '2023-08-01T12:00:00.000Z',
      properties: {
        Name: {
          id: 'title',
          name: 'Name',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'Mock Page',
                link: null
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Mock Page',
              href: null
            }
          ]
        }
      }
    };
  }
  
  console.warn(`[MOCK] Endpoint Pages non géré: ${method} ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint Pages non géré: ${method} ${endpoint}`
  };
};
