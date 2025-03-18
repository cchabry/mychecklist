
// Configuration constants for the Notion API proxy

// URL de base pour l'API Notion (direct ou via proxy)
export const NOTION_API_BASE = 'https://api.notion.com/v1';

// URL de notre fonction serverless Vercel déployée
// ⚠️ Assurez-vous que cette URL correspond exactement à votre domaine Vercel
export const VERCEL_PROXY_URL = 'https://mychecklist.vercel.app/api/notion-proxy';

// Notion API version
export const NOTION_API_VERSION = '2022-06-28';

// Timeout settings
export const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;

// Local storage keys
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  MOCK_MODE: 'notion_mock_mode',
};
