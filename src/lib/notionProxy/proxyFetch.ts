
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
  console.log(`🔹 Tentative via proxy serverless (${getDeploymentType()}): ${proxyUrl}`);
  
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
    const errorText = await response.text();
    console.error(`❌ Erreur du proxy serverless: ${response.status}`, errorText);
    throw new Error(`Erreur proxy serverless: ${response.status} ${errorText}`);
  }
  
  _usingServerlessProxy = true;
  return await response.json();
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
  
  // Check if we're in mock mode
  const mockModeEnabled = localStorage.getItem('notion_mock_mode') === 'true';
  if (mockModeEnabled) {
    console.log(`🔷 [MOCK] Requête ${method} ${endpoint}`);
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || 'no-api-key';
    console.warn(`🔑 API Key (mocked): ${apiKey}`);
    console.warn(`MODE MOCK: Les données ne sont pas réelles!`);
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
