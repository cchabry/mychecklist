
/**
 * Configuration centralisée pour le système de proxy Notion
 */

// Types de déploiement supportés
export type DeploymentType = 'local' | 'netlify' | 'vercel' | 'lovable' | 'unknown';

// Configuration des proxies CORS publics
export const PUBLIC_CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

// Clés de stockage local
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  CHECKLISTS_DATABASE_ID: 'notion_checklists_database_id',
  SELECTED_PROXY: 'notion_selected_proxy',
  LAST_ERROR: 'notion_last_error',
  MOCK_MODE: 'notion_mock_mode',
  CORS_PROXY_CACHE: 'notion_cors_proxy_cache',
  LAST_CONNECTION_TEST: 'notion_last_connection_test',
  DEBUG_MODE: 'notion_debug_mode',
  LAST_CONFIG_DATE: 'notion_last_config_date' // Ajout de la clé manquante
};

// Clés de timeout
export const TIMEOUT_MS = {
  DEFAULT: 15000,
  CONNECTION_TEST: 5000, 
  API_CALL: 30000
};

// Version de l'API Notion
export const NOTION_API_VERSION = '2022-06-28';

// URL de base Notion
export const NOTION_API_BASE = 'https://api.notion.com';

/**
 * Détermine le type de déploiement actuel
 */
export function getDeploymentType(): DeploymentType {
  if (typeof window === 'undefined') {
    // Environnement serveur
    if (process.env.NETLIFY) return 'netlify';
    if (process.env.VERCEL) return 'vercel';
    return 'unknown';
  }
  
  // Environnement navigateur
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  } else if (hostname.includes('netlify.app') || hostname.endsWith('.netlify.com')) {
    return 'netlify';
  } else if (hostname.includes('vercel.app') || hostname.endsWith('.now.sh')) {
    return 'vercel';
  } else if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return 'lovable';
  }
  
  return 'unknown';
}

/**
 * Vérifie si le token est un token OAuth Notion (commence par ntn_)
 */
export function isOAuthToken(token: string): boolean {
  return token.trim().startsWith('ntn_');
}

/**
 * Vérifie si le token est une clé d'intégration Notion (commence par secret_)
 */
export function isIntegrationKey(token: string): boolean {
  return token.trim().startsWith('secret_');
}

/**
 * Vérifie si le déploiement actuel est sur Netlify
 */
export function isNetlifyDeployment(): boolean {
  return getDeploymentType() === 'netlify';
}

/**
 * Vérifie si le déploiement actuel est en local
 */
export function isLocalDeployment(): boolean {
  return getDeploymentType() === 'local';
}

/**
 * Vérifie si le déploiement actuel est sur Vercel
 */
export function isVercelDeployment(): boolean {
  return getDeploymentType() === 'vercel';
}

/**
 * Vérifie si le déploiement actuel est sur Lovable
 */
export function isLovablePreview(): boolean {
  return getDeploymentType() === 'lovable';
}

/**
 * Vérifie si le débogage du déploiement est activé
 */
export function isDeploymentDebuggingEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.DEBUG === 'true';
  }
  
  return localStorage.getItem(STORAGE_KEYS.DEBUG_MODE) === 'true';
}

/**
 * Active le débogage du déploiement
 */
export function enableDeploymentDebugging(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, 'true');
  }
}

/**
 * Désactive le débogage du déploiement
 */
export function disableDeploymentDebugging(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, 'false');
  }
}
