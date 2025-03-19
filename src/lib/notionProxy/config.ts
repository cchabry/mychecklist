
/**
 * Configuration globale pour le proxy Notion
 */

// Constantes pour les requêtes Notion
export const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
export const NOTION_API_VERSION = '2022-06-28';
export const REQUEST_TIMEOUT_MS = 15000;
export const MAX_RETRY_ATTEMPTS = 2;

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
  AUDIT_CACHE: 'audit_cache'
};

