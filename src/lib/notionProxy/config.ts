
// Configuration pour l'API Notion et les services associés

// Constantes pour l'API Notion
export const NOTION = {
  API_BASE_URL: 'https://api.notion.com/v1',
  API_VERSION: '2022-06-28'
};

// Clés pour le stockage local
export const STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  PROJECTS_DB_ID: 'notion_projects_db_id',
  CHECKLISTS_DB_ID: 'notion_checklists_db_id',
  MOCK_MODE: 'notion_mock_mode',
  MOCK_MODE_V2: 'notion_mock_mode_v2',
  LAST_SAVED_CONFIG: 'notion_last_saved_config',
  LAST_ERROR: 'notion_last_error',
  
  // Ajout des clés manquantes
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  LAST_CONFIG_DATE: 'notion_last_config_date',
  SELECTED_PROXY: 'notion_selected_proxy'
};

// Liste des proxies CORS publics disponibles
export const PUBLIC_CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://proxy.cors.sh/'
];

// Fonctions pour vérifier le type de token Notion
export const isOAuthToken = (token: string): boolean => {
  return token && token.startsWith('secret_');
};

export const isIntegrationKey = (token: string): boolean => {
  return token && /^[a-zA-Z0-9_-]{43,50}$/.test(token) && !isOAuthToken(token);
};

// Fonctions pour vérifier le déploiement
export const getDeploymentType = (): 'vercel' | 'netlify' | 'local' | 'other' => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('vercel.app') || hostname.includes('now.sh')) {
    return 'vercel';
  }
  
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return 'netlify';
  }
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  }
  
  return 'other';
};

export const verifyProxyDeployment = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/ping');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Erreur lors de la vérification du proxy:', error);
    return false;
  }
};
