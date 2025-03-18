
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
 * Déterminer le type de déploiement (Vercel, Netlify, local)
 */
export const getDeploymentType = (): 'vercel' | 'netlify' | 'local' | 'other' => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return 'netlify';
  } else if (hostname.includes('vercel.app')) {
    return 'vercel';
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  } else {
    // Check if we're on a custom domain but deployed on Netlify
    // Look for Netlify headers or other indicators
    if (document.querySelector('meta[name="generator"][content*="Netlify"]')) {
      return 'netlify';
    }
    return 'other';
  }
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
 * Récupère l'URL du serverless proxy en fonction du déploiement
 */
export const getServerlessProxyUrl = (): string => {
  const deploymentType = getDeploymentType();
  
  // Format de l'URL en fonction du type de déploiement
  switch (deploymentType) {
    case 'netlify':
      return '/.netlify/functions/notion-proxy';
    case 'vercel':
      return '/api/notion-proxy';
    default:
      // Detect if we have netlify functions by checking the environment
      if (window.location.href.includes('.netlify.') || document.querySelector('meta[name="generator"][content*="Netlify"]')) {
        return '/.netlify/functions/notion-proxy';
      }
      return '/api/notion-proxy'; // Fallback sur le format Vercel
  }
};

/**
 * Verify if the selected proxy is working
 */
export const verifyProxyDeployment = async (force: boolean = false): Promise<boolean> => {
  try {
    // D'abord, vérifier si nous avons un serverless proxy
    const deploymentType = getDeploymentType();
    const serverlessUrl = getServerlessProxyUrl();
    
    if (deploymentType === 'netlify' || deploymentType === 'vercel') {
      // Tester le serverless proxy
      try {
        const response = await fetch(serverlessUrl);
        if (response.ok) {
          console.log(`Serverless proxy (${deploymentType}) test: SUCCESS`);
          return true;
        }
      } catch (error) {
        console.warn(`Serverless proxy (${deploymentType}) test failed:`, error);
      }
    }
    
    // Si le serverless proxy échoue ou n'est pas disponible, tester le proxy CORS client
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
    
    console.log(`CORS Proxy test result for ${proxyUrl}: ${proxyWorking ? 'SUCCESS' : 'FAILED'} (status: ${response.status})`);
    
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
    deploymentType: getDeploymentType(),
    usingClientSideProxy: true
  };
};
