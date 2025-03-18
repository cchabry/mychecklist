
// Configuration constants for the Notion API proxy

// URL de base pour l'API Notion (direct ou via proxy)
export const NOTION_API_BASE = 'https://api.notion.com/v1';

// Public CORS proxies
export const PUBLIC_CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

// Default CORS proxy to use
export const DEFAULT_CORS_PROXY = PUBLIC_CORS_PROXIES[1]; // corsproxy.io is more reliable

// Notion API version
export const NOTION_API_VERSION = '2022-06-28';

// Timeout settings
export const REQUEST_TIMEOUT_MS = 15000; // Réduit à 15 secondes pour des réponses plus rapides
export const MAX_RETRY_ATTEMPTS = 2;

// Local storage keys
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  MOCK_MODE: 'notion_mock_mode',
  SELECTED_PROXY: 'notion_selected_proxy',
  LAST_PROXY_CHECK: 'notion_last_proxy_check',
};

/**
 * Get the currently selected CORS proxy
 */
export const getSelectedProxy = (): string => {
  const savedProxy = localStorage.getItem(STORAGE_KEYS.SELECTED_PROXY);
  return savedProxy || DEFAULT_CORS_PROXY;
};

/**
 * Set the current CORS proxy
 */
export const setSelectedProxy = (proxyUrl: string): void => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PROXY, proxyUrl);
};

/**
 * Build the full proxy URL for Notion API
 */
export const buildProxyUrl = (endpoint: string): string => {
  const proxyUrl = getSelectedProxy();
  const targetUrl = `${NOTION_API_BASE}${endpoint}`;
  return `${proxyUrl}${encodeURIComponent(targetUrl)}`;
};

/**
 * Verify if the selected proxy is working
 */
export const verifyProxyDeployment = async (force: boolean = false): Promise<boolean> => {
  try {
    // Try a simple GET request to Notion API through the proxy
    const proxyUrl = getSelectedProxy();
    const testUrl = `${proxyUrl}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;

    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'Authorization': 'Bearer test_token',
        'Notion-Version': NOTION_API_VERSION
      }
    });

    // Even a 401 Unauthorized is fine - it means the proxy successfully contacted Notion
    const proxyWorking = response.status !== 0 && response.status !== 404;
    
    console.log(`Proxy test result for ${proxyUrl}: ${proxyWorking ? 'SUCCESS' : 'FAILED'} (status: ${response.status})`);
    
    return proxyWorking;
  } catch (error) {
    console.error('Proxy verification failed:', error);
    return false;
  }
};

/**
 * Reset all proxy-related settings
 */
export const resetProxyCache = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SELECTED_PROXY);
  console.log('🔄 Proxy settings reset');
};

/**
 * Try all available proxies and select the first working one
 */
export const findWorkingProxy = async (): Promise<string | null> => {
  for (const proxyUrl of PUBLIC_CORS_PROXIES) {
    try {
      const testUrl = `${proxyUrl}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': 'Bearer test_token',
          'Notion-Version': NOTION_API_VERSION
        }
      });
      
      // Even a 401 is good - it means we reached Notion's API
      if (response.status !== 0 && response.status !== 404) {
        console.log(`Found working proxy: ${proxyUrl}`);
        setSelectedProxy(proxyUrl);
        return proxyUrl;
      }
    } catch (error) {
      console.log(`Proxy ${proxyUrl} test failed:`, error);
    }
  }
  
  return null;
};

/**
 * Check the status of the current proxy solution
 */
export const getProxyStatus = () => {
  return {
    currentProxy: getSelectedProxy(),
    usingClientSideProxy: true
  };
};
