
// Configuration des clés de stockage
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
  CHECKLISTS_DATABASE_ID: 'notion_checklists_database_id',
  CHECKLISTS_DB_ID: 'notion_checklists_database_id', // Alias pour maintenir la compatibilité
  MOCK_MODE: 'notion_mock_mode',
  LAST_ERROR: 'notion_last_error',
  CORS_PROXY: 'notion_cors_proxy',
  LAST_CONFIG_DATE: 'notion_last_config_date', // Ajout de la clé pour la date de configuration
  DEPLOYMENT_DEBUG: 'notion_deployment_debug' // Nouvelle clé pour le débogage de déploiement
};

// Configuration de l'API Notion
export const NOTION_API_VERSION = '2022-06-28';
export const NOTION_API_BASE_URL = 'https://api.notion.com/v1';

// Liste des proxies CORS publics
export const PUBLIC_CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/",
  "https://proxy.cors.sh/",
  "https://cors-proxy.htmldriven.com/?url=",
  "https://api.allorigins.win/raw?url="
];

// Fonctions utilitaires pour la validation des tokens
export const isOAuthToken = (token: string): boolean => {
  return typeof token === 'string' && token.startsWith('ntn_');
};

export const isIntegrationKey = (token: string): boolean => {
  return typeof token === 'string' && token.startsWith('secret_');
};

// Validateur pour vérifier si une clé est valide
export function isValidNotionKey(key: string): boolean {
  return isOAuthToken(key) || isIntegrationKey(key);
}

export function getTokenType(token: string): 'oauth' | 'integration' | 'unknown' {
  if (isOAuthToken(token)) return 'oauth';
  if (isIntegrationKey(token)) return 'integration';
  return 'unknown';
}

// Détecte le type de déploiement de l'application
export function getDeploymentType(): 'vercel' | 'netlify' | 'local' | 'lovable' | 'other' {
  const hostname = window.location.hostname;
  
  // Vérifier si nous sommes en environnement local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  }
  
  // Vérifier si nous sommes sur Lovable
  if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return 'lovable';
  }
  
  // Vérifier si nous sommes sur Vercel
  if (hostname.includes('vercel.app') || hostname.endsWith('.now.sh')) {
    return 'vercel';
  }
  
  // Vérifier si nous sommes sur Netlify
  if (hostname.includes('netlify.app') || hostname.endsWith('.netlify.com')) {
    return 'netlify';
  }
  
  // Par défaut, on retourne 'other'
  return 'other';
}

// Détermine si nous sommes sur un déploiement Netlify
export function isNetlifyDeployment(): boolean {
  return getDeploymentType() === 'netlify';
}

// Détermine si nous sommes sur un aperçu Lovable
export function isLovablePreview(): boolean {
  return getDeploymentType() === 'lovable';
}

// Activer le mode débogage pour le déploiement
export function enableDeploymentDebugging(): void {
  localStorage.setItem(STORAGE_KEYS.DEPLOYMENT_DEBUG, 'true');
  console.log('✅ Débogage de déploiement activé');
}

// Désactiver le mode débogage pour le déploiement
export function disableDeploymentDebugging(): void {
  localStorage.removeItem(STORAGE_KEYS.DEPLOYMENT_DEBUG);
  console.log('❌ Débogage de déploiement désactivé');
}

// Vérifier si le débogage de déploiement est actif
export function isDeploymentDebuggingEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.DEPLOYMENT_DEBUG) === 'true';
}
