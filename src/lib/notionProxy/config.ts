
/**
 * Configuration globale pour le proxy Notion
 */

// Constantes pour les requêtes Notion
export const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
export const NOTION_API_VERSION = '2022-06-28';
export const REQUEST_TIMEOUT_MS = 15000;
export const MAX_RETRY_ATTEMPTS = 2;

// Configuration des proxies CORS publics
export const PUBLIC_CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

// Clés pour le stockage local
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  CHECKLISTS_DB_ID: 'notion_checklists_database_id',
  LAST_CONFIG_DATE: 'notion_last_config_date',
  MOCK_MODE: 'notion_mock_mode',
  LAST_ERROR: 'notion_last_error',
  FORCE_REAL: 'notion_force_real',
  TEMP_MOCK: 'temp_was_mock',
  PROJECTS_CACHE: 'projects_cache',
  AUDIT_CACHE: 'audit_cache',
  SELECTED_PROXY: 'notion_selected_proxy'
};

/**
 * Vérifie si une clé API est au format OAuth
 * @param token Clé API à vérifier
 */
export const isOAuthToken = (token: string): boolean => {
  return token.startsWith('ntn_');
};

/**
 * Vérifie si une clé API est au format d'intégration
 * @param token Clé API à vérifier
 */
export const isIntegrationKey = (token: string): boolean => {
  return token.startsWith('secret_');
};

/**
 * Obtient le type de déploiement actuel (Vercel, Netlify ou local)
 */
export const getDeploymentType = (): 'vercel' | 'netlify' | 'local' => {
  const hostname = window.location.hostname;
  if (hostname.includes('netlify')) return 'netlify';
  if (hostname.includes('vercel')) return 'vercel';
  return 'local';
};

/**
 * Vérifie si le proxy de déploiement est fonctionnel
 * @param showUI Afficher les indicateurs visuels pendant la vérification
 * @param apiKey Clé API Notion optionnelle
 */
export const verifyProxyDeployment = async (
  showUI: boolean = false, 
  apiKey?: string
): Promise<boolean> => {
  const deploymentType = getDeploymentType();
  
  try {
    // Récupérer la clé API pour le test si non fournie
    if (!apiKey) {
      apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || 'test_token_for_proxy_check';
    }
    
    // Déterminer l'URL du proxy en fonction du déploiement
    const proxyUrl = deploymentType === 'netlify' 
      ? '/.netlify/functions/notion-proxy' 
      : '/api/notion-proxy';
    
    // Effectuer une requête de test
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/users/me',
        method: 'GET',
        token: apiKey
      })
    });
    
    // Vérifier si le proxy est fonctionnel
    return response.status !== 404 && response.status !== 0;
  } catch (error) {
    console.error('Proxy deployment verification failed:', error);
    return false;
  }
};
