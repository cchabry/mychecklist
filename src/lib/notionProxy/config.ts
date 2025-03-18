
// Configuration constants for the Notion API proxy

// URL de base pour l'API Notion (direct ou via proxy)
export const NOTION_API_BASE = 'https://api.notion.com/v1';

// URL de notre fonction serverless Vercel déployée
// Cette URL sera automatiquement déterminée en fonction de l'environnement
export const VERCEL_PROXY_URL = 
  process.env.NODE_ENV === 'production'
    ? `${window.location.origin}/api/notion-proxy`
    : '/api/notion-proxy'; // Utilisation d'une URL relative en développement

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

// Configuration des chemins alternatifs pour le proxy
export const PROXY_PATHS = [
  '/api/notion-proxy',       // Chemin standard
  '/api/notion-proxy.js',    // Chemin alternatif .js 
  '/api/notion-proxy/index', // Structure avec index
  '/api/notionproxy',        // Alternative sans tiret
];

// Fonction pour déterminer l'URL valide du proxy
export const getValidProxyUrl = async (): Promise<string> => {
  // En développement, utiliser toujours l'URL relative
  if (process.env.NODE_ENV !== 'production') {
    return '/api/notion-proxy';
  }
  
  // En production, tester les différents chemins possibles
  const baseUrl = window.location.origin;
  
  for (const path of PROXY_PATHS) {
    const url = `${baseUrl}${path}`;
    
    try {
      // Faire une requête OPTIONS pour tester l'existence de l'endpoint
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: { 'Accept': 'application/json' },
        mode: 'no-cors',
        cache: 'no-store'
      });
      
      console.log(`Tested proxy URL: ${url}, status: ${response.status}`);
      
      // Si la requête ne génère pas d'erreur, considérer l'URL comme valide
      return url;
    } catch (error) {
      console.log(`Failed to access ${url}: ${error.message}`);
      // Continuer avec le prochain chemin
    }
  }
  
  // Par défaut, retourner le chemin standard
  return `${baseUrl}/api/notion-proxy`;
};

// Vérification de la configuration de l'URL du proxy
export const isProxyUrlValid = () => {
  // En développement local, on utilise une URL relative
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // En production, l'URL doit exister et contenir le nom d'hôte actuel
  const url = VERCEL_PROXY_URL;
  const host = window.location.host;
  
  return !!url && url.includes('/api/notion-proxy');
};
