import { mockNotionResponse } from './mockData';
import { 
  NOTION_API_VERSION, 
  REQUEST_TIMEOUT_MS, 
  MAX_RETRY_ATTEMPTS,
  buildProxyUrl,
  findWorkingProxy,
  getSelectedProxy,
  STORAGE_KEYS,
  getDeploymentType,
  getServerlessProxyUrl
} from './config';

// Status variables
let _lastError: Error | null = null;
let _usingFallbackProxy = false;
let _usingServerlessProxy = false;

/**
 * Reset all proxy caches and status
 */
export const resetAllProxyCaches = () => {
  _lastError = null;
  _usingFallbackProxy = false;
  _usingServerlessProxy = false;
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
    usingFallbackProxy: _usingFallbackProxy,
    usingServerlessProxy: _usingServerlessProxy,
    deploymentType: getDeploymentType()
  };
};

/**
 * Extrait un message d'erreur plus lisible des réponses d'erreur de Notion
 */
const extractNotionErrorMessage = (status: number, errorData: any): string => {
  if (!errorData) return `Erreur ${status}`;
  
  // Erreurs d'authentification
  if (status === 401) {
    return "Erreur d'authentification: La clé d'API Notion est invalide ou a expiré";
  }
  
  // Problèmes d'autorisation
  if (status === 403) {
    return "Erreur d'autorisation: Votre intégration Notion n'a pas accès à cette ressource";
  }
  
  // Problèmes de ressource non trouvée
  if (status === 404) {
    if (errorData.code === 'object_not_found') {
      return "Ressource introuvable: L'ID de base de données ou de page n'existe pas";
    }
    return "Ressource introuvable: Vérifiez les identifiants utilisés";
  }
  
  // Renvoyer le message d'erreur fourni par Notion si disponible
  return errorData.message || errorData.code 
    ? `Erreur Notion (${status}): ${errorData.message || errorData.code}`
    : `Erreur inattendue (${status})`;
};

/**
 * Tenter une requête via le proxy serverless (Vercel/Netlify)
 */
async function tryServerlessProxy<T>(
  endpoint: string,
  method: string,
  body?: any,
  token?: string,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const proxyUrl = getServerlessProxyUrl();
  const deploymentType = getDeploymentType();
  console.log(`🔹 Tentative via proxy serverless (${deploymentType}): ${proxyUrl}`);
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify({
        endpoint,
        method,
        body,
        token
      })
    });
    
    if (!response.ok) {
      let errorData: any = null;
      let errorText = '';
      
      try {
        // Try to get JSON error
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          // Get text error
          errorText = await response.text();
          console.log('Réponse texte d\'erreur:', errorText);
          errorData = { message: errorText };
        }
      } catch (parseError) {
        console.warn('Could not parse error response', parseError);
        errorData = { message: `Couldn't parse error response: ${parseError.message}` };
      }
      
      // Log details about the error
      console.error(`❌ Erreur du proxy serverless: ${response.status}`, errorData);
      
      // Improved error handling for common Notion API errors
      if (response.status === 401) {
        // Vérifier si le token commence par ntn_ (OAuth) au lieu de secret_ (Integration)
        if (token && token.startsWith('ntn_')) {
          throw new Error(`Erreur d'authentification: Vous utilisez un token OAuth (ntn_) au lieu d'une clé d'intégration (secret_)`);
        } else {
          throw new Error(`Erreur d'authentification Notion: La clé d'API est invalide ou a expiré`);
        }
      } else if (response.status === 403) {
        throw new Error(`Erreur d'autorisation Notion: L'intégration n'a pas accès à cette ressource`);
      } else if (response.status === 404 && errorData?.code === 'object_not_found') {
        throw new Error(`Ressource Notion introuvable: Vérifiez l'ID de la base de données ou de la page`);
      } else {
        const message = errorData?.message || errorData?.error || errorText;
        throw new Error(`Erreur proxy serverless: ${response.status} ${message}`);
      }
    }
    
    // Try to parse response as JSON
    let responseData: any;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse serverless proxy response as JSON:', jsonError);
      
      // Try to get as text
      const textResponse = await response.text();
      throw new Error(`Proxy response is not valid JSON: ${textResponse.substring(0, 100)}`);
    }
    
    _usingServerlessProxy = true;
    return responseData as T;
  } catch (error) {
    console.error('Serverless proxy error:', error);
    throw error;
  }
}

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
  
  // Vérifier le format de la clé API
  if (token.startsWith('ntn_')) {
    console.error('Type de clé API incorrect: Vous utilisez un token OAuth (ntn_)');
    throw new Error('Type de clé API incorrect: Vous devez utiliser une clé d\'intégration qui commence par "secret_", pas un token OAuth (ntn_)');
  }
  
  // Check if we're in mock mode
  const mockModeEnabled = localStorage.getItem('notion_mock_mode') === 'true';
  if (mockModeEnabled) {
    console.log(`🔷 [MOCK] Requête ${method} ${endpoint}`);
    return mockNotionResponse(endpoint, method, body) as T;
  }
  
  // First try the serverless proxy (Vercel/Netlify)
  if (getDeploymentType() !== 'local') {
    try {
      const result = await tryServerlessProxy<T>(endpoint, method, body, token, customHeaders);
      
      // Clear any previous errors on success
      _lastError = null;
      localStorage.removeItem('notion_last_error');
      
      return result;
    } catch (serverlessError) {
      console.error(`❌ Erreur avec le proxy serverless:`, serverlessError);
      
      // Si l'erreur est d'authentification (401), ne pas essayer le proxy client
      if (serverlessError.message?.includes('authentification') || 
          serverlessError.message?.includes('401')) {
        throw serverlessError; // Propager directement l'erreur d'authentification
      }
      
      // Continue to client-side proxy as fallback
    }
  }
  
  // If serverless proxy failed, try the client-side CORS proxy
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
