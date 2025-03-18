
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
export const REQUEST_TIMEOUT_MS = 15000; // Réduit à 15 secondes pour des réponses plus rapides
export const MAX_RETRY_ATTEMPTS = 2;

// Local storage keys
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  MOCK_MODE: 'notion_mock_mode',
};

// Configuration des chemins alternatifs pour le proxy
export const PROXY_PATHS = [
  '/api/notion-proxy',       // Chemin standard
  '/.netlify/functions/notion-proxy', // Support Netlify
  '/api/notion-proxy/index', // Structure avec index
  '/api/notionproxy',        // Alternative sans tiret
];

// Vérification simple du statut de déploiement
let _isDeploymentVerified = false;
let _validProxyPath: string | null = null;

// Fonction pour vérifier si le proxy est déployé
export const verifyProxyDeployment = async (): Promise<boolean> => {
  // En développement, on considère que c'est déployé
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  try {
    // Vérifier d'abord le ping
    const pingResponse = await fetch(`${window.location.origin}/api/ping`, {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!pingResponse.ok) {
      console.error('❌ Ping API failed:', pingResponse.status);
      return false;
    }
    
    console.log('✅ API ping successful');
    
    // Puis vérifier le proxy
    const proxyResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
      method: 'HEAD',
      cache: 'no-store'
    }).catch(() => null);
    
    // Si on a une réponse (même avec erreur), c'est que le fichier existe
    _isDeploymentVerified = !!proxyResponse;
    return _isDeploymentVerified;
  } catch (error) {
    console.error('❌ Deployment verification failed:', error);
    return false;
  }
};

// Fonction pour déterminer l'URL valide du proxy
export const getValidProxyUrl = async (): Promise<string> => {
  // Si on a déjà trouvé un chemin valide, on le retourne
  if (_validProxyPath) {
    return process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}${_validProxyPath}`
      : _validProxyPath;
  }
  
  // En développement, utiliser toujours l'URL relative
  if (process.env.NODE_ENV !== 'production') {
    _validProxyPath = '/api/notion-proxy';
    return _validProxyPath;
  }
  
  // En production, tester les différents chemins possibles
  const baseUrl = window.location.origin;
  
  for (const path of PROXY_PATHS) {
    const url = `${baseUrl}${path}`;
    
    try {
      // Faire une requête HEAD pour tester l'existence de l'endpoint
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      console.log(`Tested proxy URL: ${url}, status: ${response.status}`);
      
      // Si la requête ne génère pas d'erreur 404, considérer l'URL comme valide
      if (response.status !== 404) {
        _validProxyPath = path;
        return url;
      }
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

// Statut du déploiement
export const isDeploymentVerified = () => _isDeploymentVerified;
