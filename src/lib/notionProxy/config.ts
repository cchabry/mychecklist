
/**
 * Configuration de l'intégration Notion
 */
export const NOTION = {
  API_VERSION: '2022-06-28',
  API_BASE_URL: 'https://api.notion.com/v1',
};

/**
 * Clés de stockage local
 */
export const STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  PROJECTS_DB_ID: 'notion_projects_db_id',
  CHECKLISTS_DB_ID: 'notion_checklists_db_id',
  MOCK_MODE: 'notion_mock_mode',
  MOCK_MODE_V2: 'notion_mock_mode_v2',
  
  // Autres clés spécifiques
  LAST_SAVED_CONFIG: 'notion_last_saved_config',
  LAST_ERROR: 'notion_last_error',
  
  // Keys referenced in code but not defined
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  SELECTED_PROXY: 'notion_selected_proxy',
  LAST_CONFIG_DATE: 'notion_last_config_date'
};

/**
 * Valeurs par défaut pour la configuration
 */
export const DEFAULT_CONFIG = {
  apiKey: '',
  projectsDbId: '',
  checklistsDbId: ''
};

/**
 * Liste des proxies CORS publics disponibles
 */
export const PUBLIC_CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors-proxy.htmldriven.com/?url=',
  'https://api.allorigins.win/raw?url='
];

/**
 * Fonction pour vérifier si une chaîne est un token OAuth Notion
 */
export function isOAuthToken(token: string): boolean {
  return token.startsWith('ntn_');
}

/**
 * Fonction pour vérifier si une chaîne est une clé d'intégration Notion
 */
export function isIntegrationKey(key: string): boolean {
  return key.startsWith('secret_');
}

/**
 * Vérifie le déploiement du proxy
 */
export async function verifyProxyDeployment(showLogs = false, apiKey?: string): Promise<boolean> {
  try {
    // Implementation stub - replace with actual implementation
    console.log('Verifying proxy deployment', { showLogs, apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'none' });
    return true;
  } catch (error) {
    console.error('Proxy verification failed:', error);
    return false;
  }
}

/**
 * Obtient le type de déploiement
 */
export function getDeploymentType(): string {
  // Implementation stub - replace with actual implementation
  return 'vercel';
}
