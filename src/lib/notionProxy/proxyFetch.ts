import {
  STORAGE_KEYS
} from '@/lib/constants';
import { mockNotionResponse } from './mockData';
import { 
  NOTION_API_VERSION, 
  REQUEST_TIMEOUT_MS, 
  MAX_RETRY_ATTEMPTS,
  buildProxyUrl,
  findWorkingProxy,
  getSelectedProxy
} from './config';

// Status variables
let _lastError: Error | null = null;
let _usingFallbackProxy = false;

/**
 * Reset all proxy caches and status
 */
export const resetAllProxyCaches = () => {
  _lastError = null;
  _usingFallbackProxy = false;
  localStorage.removeItem('notion_last_error');
  console.log('Proxy caches reset');
};

/**
 * Get the current proxy status
 */
export const getProxyStatus = () => {
  const lastErrorString = localStorage.getItem('notion_last_error');
  
  return {
    lastError: lastErrorString ? JSON.parse(lastErrorString) : _lastError,
    currentProxy: getSelectedProxy(),
    usingFallbackProxy: _usingFallbackProxy
  };
};

/**
 * Make a request to the Notion API via the CORS proxy
 */
export const notionApiRequest = async <T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string,
  customHeaders: Record<string, string> = {}
): Promise<T> => {
  if (!token) {
    token = localStorage.getItem('notion_api_key') || '';
  }
  
  if (!token) {
    throw new Error('Clé API Notion manquante. Veuillez configurer votre clé API dans les paramètres.');
  }
  
  // Check if we're in mock mode
  const mockModeEnabled = localStorage.getItem('notion_mock_mode') === 'true';
  if (mockModeEnabled) {
    console.log(`🔷 [MOCK] Requête ${method} ${endpoint}`);
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || 'no-api-key';
    console.warn(`🔑 API Key (mocked): ${apiKey}`);
    console.warn(`MODE MOCK: Les données ne sont pas réelles!`);
    return mockNotionResponse(endpoint, method, body) as T;
  }
  
  // First try the client-side CORS proxy
  try {
    const proxyUrl = buildProxyUrl(endpoint);
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    console.log(`📡 Requête via proxy client: ${method} ${endpoint}`);
    
    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };
    
    // Add timeout to the request
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    requestOptions.signal = controller.signal;
    
    const response = await fetch(proxyUrl, requestOptions);
    clearTimeout(id);
    
    if (!response.ok) {
      // If the response is not OK, handle Notion API errors
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur API Notion: ${response.status} ${response.statusText}`;
      
      // Store the error
      _lastError = new Error(errorMessage);
      localStorage.setItem('notion_last_error', JSON.stringify({
        message: errorMessage,
        status: response.status,
        endpoint
      }));
      
      throw new Error(errorMessage);
    }
    
    // Clear any previous errors on success
    _lastError = null;
    localStorage.removeItem('notion_last_error');
    
    return response.json();
  } catch (error) {
    console.error(`❌ Erreur lors de la requête via proxy client: ${error.message}`);
    
    // Try another proxy if the current one failed
    if (!_usingFallbackProxy) {
      try {
        console.log('🔄 Tentative avec un autre proxy CORS...');
        const newProxy = await findWorkingProxy();
        
        if (newProxy) {
          _usingFallbackProxy = true;
          console.log(`✅ Nouveau proxy trouvé: ${newProxy}`);
          // Retry the request with the new proxy
          return notionApiRequest(endpoint, method, body, token, customHeaders);
        }
      } catch (proxyError) {
        console.error('❌ Échec de la tentative avec un autre proxy:', proxyError);
      }
    }
    
    // Store the error
    _lastError = error;
    localStorage.setItem('notion_last_error', JSON.stringify({
      message: error.message,
      endpoint
    }));
    
    throw error;
  }
};

/**
 * Simule une réponse de l'API Notion
 */
const mockNotionResponse = (endpoint: string, method: string, body: any) => {
  console.log(`[MOCK] Appel API Notion: ${method} ${endpoint}`);
  
  if (endpoint.startsWith('/users')) {
    return mockNotionUsers(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/databases')) {
    return mockNotionDatabases(endpoint, method, body);
  }
  
  if (endpoint.startsWith('/pages')) {
    return mockNotionPages(endpoint, method, body);
  }
  
  console.warn(`[MOCK] Endpoint non géré: ${endpoint}`);
  return {
    object: 'error',
    status: 400,
    code: 'unsupported_endpoint',
    message: `Mock endpoint non géré: ${endpoint}`
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
