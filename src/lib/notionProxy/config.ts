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
  LAST_ERROR: 'notion_last_error'
};

/**
 * Valeurs par défaut pour la configuration
 */
export const DEFAULT_CONFIG = {
  apiKey: '',
  projectsDbId: '',
  checklistsDbId: ''
};
