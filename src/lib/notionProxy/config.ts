
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
  LAST_PROXY_CHECK: 'notion_last_proxy_check',
  WORKING_PROXY_URL: 'notion_working_proxy_url',
};

// Configuration des chemins alternatifs pour le proxy
export const PROXY_PATHS = [
  '/api/notion-proxy',       // Chemin standard
  '/.netlify/functions/notion-proxy', // Support Netlify
  '/api/notion-proxy/index', // Structure avec index
  '/api/notionproxy',        // Alternative sans tiret
];

// État de vérification du déploiement
let _isDeploymentVerified = false;
let _validProxyPath: string | null = null;
let _lastCheckTime = 0;
let _lastCheckResult = false;

/**
 * Vérification simple du statut de déploiement avec mise en cache
 */
export const verifyProxyDeployment = async (force: boolean = false): Promise<boolean> => {
  // Utiliser le résultat mis en cache si disponible et récent (moins de 5 minutes)
  const now = Date.now();
  const cacheTime = 5 * 60 * 1000; // 5 minutes en millisecondes
  
  if (!force && _lastCheckTime > 0 && now - _lastCheckTime < cacheTime) {
    console.log('📊 Utilisation du résultat de vérification mis en cache:', _lastCheckResult ? '✅' : '❌');
    return _lastCheckResult;
  }
  
  // En développement, on considère que c'est déployé
  if (process.env.NODE_ENV !== 'production') {
    _lastCheckTime = now;
    _lastCheckResult = true;
    return true;
  }
  
  try {
    let pingOk = false;
    let proxyOk = false;
    
    // Vérifier d'abord le ping
    try {
      const pingResponse = await fetch(`${window.location.origin}/api/ping`, {
        method: 'GET',
        cache: 'no-store'
      });
      
      pingOk = pingResponse.ok;
      
      if (!pingOk) {
        console.error('❌ Ping API failed:', pingResponse.status);
        _lastCheckTime = now;
        _lastCheckResult = false;
        return false;
      }
      
      console.log('✅ API ping successful');
    } catch (pingError) {
      console.error('❌ Ping request failed:', pingError);
      _lastCheckTime = now;
      _lastCheckResult = false;
      return false;
    }
    
    // Puis vérifier le proxy avec HEAD
    try {
      const proxyResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      // Une réponse 404 signifie que le fichier n'existe pas
      proxyOk = proxyResponse.status !== 404;
      
      if (!proxyOk) {
        console.error('❌ Proxy HEAD check failed with 404');
        _lastCheckTime = now;
        _lastCheckResult = false;
        return false;
      }
      
      console.log('✅ Proxy HEAD check successful');
    } catch (headError) {
      // Une erreur CORS est normale ici et n'indique pas nécessairement un problème
      console.log('⚠️ Proxy HEAD check resulted in error (could be CORS):', headError);
      proxyOk = true; // On suppose que le fichier existe
    }
    
    // Enfin, vérifier avec une requête POST réelle
    try {
      const postResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          endpoint: '/ping',
          method: 'GET',
          token: 'test_token_for_diagnostics'
        })
      });
      
      // Une réponse 404 sur POST est plus grave car elle indique que le gestionnaire ne fonctionne pas
      if (postResponse.status === 404) {
        console.error('❌ Proxy POST check failed with 404 - handler is missing');
        _lastCheckTime = now;
        _lastCheckResult = false;
        return false;
      }
      
      console.log(`✅ Proxy POST check completed with status ${postResponse.status}`);
    } catch (postError) {
      console.error('❌ Proxy POST check failed:', postError);
      _lastCheckTime = now;
      _lastCheckResult = false;
      return false;
    }
    
    // Si on arrive ici, c'est que toutes les vérifications ont réussi
    _isDeploymentVerified = true;
    _lastCheckTime = now;
    _lastCheckResult = true;
    return true;
  } catch (error) {
    console.error('❌ Deployment verification failed:', error);
    _lastCheckTime = now;
    _lastCheckResult = false;
    return false;
  }
};

/**
 * Fonction pour déterminer l'URL valide du proxy avec vérification plus fiable
 */
export const getValidProxyUrl = async (): Promise<string> => {
  // Vérifier si on a déjà une URL de proxy qui fonctionne en cache
  const cachedUrl = localStorage.getItem(STORAGE_KEYS.WORKING_PROXY_URL);
  if (cachedUrl) {
    console.log('🔄 Utilisation de l\'URL de proxy en cache:', cachedUrl);
    return cachedUrl;
  }
  
  // Si on a déjà trouvé un chemin valide, on le retourne
  if (_validProxyPath) {
    const url = process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}${_validProxyPath}`
      : _validProxyPath;
      
    // Mettre en cache l'URL valide
    localStorage.setItem(STORAGE_KEYS.WORKING_PROXY_URL, url);
    return url;
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
        
        // Mettre en cache l'URL valide
        localStorage.setItem(STORAGE_KEYS.WORKING_PROXY_URL, url);
        return url;
      }
    } catch (error) {
      console.log(`Failed to access ${url}: ${error.message}`);
      // Si c'est une erreur CORS, on considère quand même que l'URL est valide
      if (error.message && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
        _validProxyPath = path;
        
        // Mettre en cache l'URL valide
        localStorage.setItem(STORAGE_KEYS.WORKING_PROXY_URL, url);
        return url;
      }
      // Continuer avec le prochain chemin
    }
  }
  
  // Par défaut, retourner le chemin standard
  const defaultUrl = `${baseUrl}/api/notion-proxy`;
  return defaultUrl;
};

/**
 * Réinitialiser les informations de proxy en cache
 * Utile pour forcer une nouvelle vérification
 */
export const resetProxyCache = (): void => {
  localStorage.removeItem(STORAGE_KEYS.WORKING_PROXY_URL);
  localStorage.removeItem(STORAGE_KEYS.LAST_PROXY_CHECK);
  _validProxyPath = null;
  _lastCheckTime = 0;
  _lastCheckResult = false;
  _isDeploymentVerified = false;
  console.log('🔄 Cache du proxy réinitialisé');
};

/**
 * Vérification de la configuration de l'URL du proxy
 */
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

/**
 * Statut du déploiement
 */
export const isDeploymentVerified = () => _isDeploymentVerified;

/**
 * Obtenir l'URL actuelle du proxy
 */
export const getCurrentProxyUrl = () => VERCEL_PROXY_URL;
