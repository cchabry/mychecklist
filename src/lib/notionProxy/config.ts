
/**
 * Configuration du proxy Notion
 */

// Clés de stockage localStorage
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  AUDIT_DATABASE_ID: 'notion_audit_database_id',
  MOCK_MODE: 'notion_mock_mode',
  LAST_ERROR: 'notion_last_error'
};

// Configurations des proxys
export const PROXY_CONFIG = {
  // URL de base pour les requêtes serverless (basée sur l'environnement)
  SERVERLESS_BASE_URL: detectServerlessBaseUrl(),
  
  // Liste des proxys CORS publics disponibles en fallback
  PUBLIC_CORS_PROXIES: [
    "https://corsproxy.io/?",
    "https://cors-anywhere.herokuapp.com/",
    "https://api.allorigins.win/raw?url="
  ],
  
  // Délai d'attente maximum pour les requêtes (ms)
  REQUEST_TIMEOUT: 30000,
  
  // Version de l'API Notion
  NOTION_API_VERSION: '2022-06-28',
  
  // URL de base de l'API Notion
  NOTION_API_BASE: 'https://api.notion.com/v1'
};

/**
 * Détecte l'URL de base pour les fonctions serverless selon l'environnement
 */
function detectServerlessBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '/api';
  }
  
  const hostname = window.location.hostname;
  
  // Déploiement Netlify
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return '/.netlify/functions';
  }
  
  // Déploiement Vercel (au cas où)
  if (hostname.includes('vercel.app')) {
    return '/api';
  }
  
  // Environnement de développement local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Vérifier le port pour différencier entre dev et fonctions locales
    return window.location.port === '8888' ? '/.netlify/functions' : '/api';
  }
  
  // Par défaut, utiliser le chemin générique /api
  return '/api';
}

/**
 * Détermine le type de déploiement actuel
 */
export function getDeploymentType(): string {
  if (typeof window === 'undefined') return 'server';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  }
  
  if (hostname.includes('netlify')) {
    return 'netlify';
  }
  
  if (hostname.includes('vercel')) {
    return 'vercel';
  }
  
  if (isLovablePreview()) {
    return 'lovable';
  }
  
  return 'custom';
}

/**
 * Vérifie si l'application est déployée sur Netlify
 */
export function isNetlifyDeployment(): boolean {
  return getDeploymentType() === 'netlify';
}

/**
 * Vérifie si l'application est en prévisualisation Lovable
 */
export function isLovablePreview(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('lovableproject.com');
}

/**
 * Vérifie si le débogage du déploiement est activé
 */
export function isDeploymentDebuggingEnabled(): boolean {
  return localStorage.getItem('debug_deployment') === 'true';
}

/**
 * Construit l'URL complète du proxy serverless
 */
export function getServerlessProxyUrl(endpoint?: string): string {
  const base = PROXY_CONFIG.SERVERLESS_BASE_URL;
  
  if (!endpoint) {
    return `${base}/notion-proxy`;
  }
  
  return `${base}/notion-proxy${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}
