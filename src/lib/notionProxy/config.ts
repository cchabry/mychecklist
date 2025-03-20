
// Configuration for the Notion API proxy

// Storage keys for localStorage
export const STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  MOCK_MODE: 'notion_mock_mode',
  MOCK_MODE_V2: 'notion_mock_mode_v2',
  NOTION_ERROR: 'notion_last_error'
};

// Notion API configuration
export const NOTION = {
  API_VERSION: '2022-06-28',
  API_BASE_URL: '/api/notion', // Endpoint relatif pour le proxy
  DIRECT_API_URL: 'https://api.notion.com/v1' // URL directe de l'API (inaccessible sans proxy à cause de CORS)
};

/**
 * Vérifie si le proxy est correctement déployé et fonctionnel
 * @returns {Promise<boolean>} True si le proxy fonctionne, false sinon
 */
export const verifyProxyDeployment = async (showLogs: boolean = false, apiKey?: string): Promise<boolean> => {
  const url = `${NOTION.API_BASE_URL}/users/me`;
  
  try {
    if (showLogs) console.log('Testing proxy deployment with URL:', url);
    
    // Si une clé API est fournie, l'utiliser
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Notion-Version': NOTION.API_VERSION
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      // Sinon, utiliser la clé stockée dans localStorage
      const storedKey = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
      if (storedKey) {
        headers['Authorization'] = `Bearer ${storedKey}`;
      } else {
        if (showLogs) console.log('No API key available for testing');
        return false;
      }
    }
    
    const response = await fetch(url, { headers });
    
    if (showLogs) {
      console.log('Proxy response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    }
    
    return response.ok;
  } catch (error) {
    if (showLogs) console.error('Proxy verification failed:', error);
    return false;
  }
};

// Helper functions for token type detection
export const isIntegrationKey = (key: string): boolean => {
  return key.startsWith('secret_');
};

export const isOAuthToken = (key: string): boolean => {
  return key.startsWith('ntn_');
};
