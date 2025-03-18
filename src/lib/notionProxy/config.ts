
import { toast } from 'sonner';

// Constantes pour l'API Notion
export const NOTION_API_VERSION = '2022-06-28';
export const REQUEST_TIMEOUT_MS = 10000;
export const MAX_RETRY_ATTEMPTS = 3;

// Liste des proxies CORS publics disponibles
export const PUBLIC_CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://cors-proxy.htmldriven.com/?url=',
  'https://crossorigin.me/'
];

// Clés de stockage local
export const STORAGE_KEYS = {
  SELECTED_PROXY: 'notion_selected_proxy',
  MOCK_MODE: 'notion_mock_mode',
  API_KEY: 'notion_api_key',
  DATABASE_ID: 'notion_database_id',
};

/**
 * Détecte le type de déploiement
 */
export const getDeploymentType = (): 'vercel' | 'netlify' | 'local' | 'other' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  }
  
  // Détection de Vercel
  if (hostname.includes('vercel.app') || hostname.includes('.now.sh')) {
    return 'vercel';
  }
  
  // Détection de Netlify
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return 'netlify';
  }
  
  return 'other';
};

/**
 * Obtient l'URL du proxy serverless
 */
export const getServerlessProxyUrl = (): string => {
  const deploymentType = getDeploymentType();
  
  if (deploymentType === 'netlify') {
    return '/.netlify/functions/notion-proxy';
  }
  
  return '/api/notion-proxy';
};

/**
 * Obtient le proxy CORS sélectionné
 */
export const getSelectedProxy = (): string => {
  const selectedProxy = localStorage.getItem(STORAGE_KEYS.SELECTED_PROXY);
  if (selectedProxy) {
    console.log(`Proxy CORS sélectionné: ${selectedProxy}`);
    return selectedProxy;
  }
  
  // Proxy par défaut
  const defaultProxy = PUBLIC_CORS_PROXIES[0];
  console.log(`Aucun proxy sélectionné, utilisation par défaut: ${defaultProxy}`);
  return defaultProxy;
};

/**
 * Définit le proxy CORS à utiliser
 */
export const setSelectedProxy = (proxyUrl: string): void => {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PROXY, proxyUrl);
  console.log(`Nouveau proxy CORS configuré: ${proxyUrl}`);
};

/**
 * Construit l'URL complète pour la requête via le proxy CORS
 */
export const buildProxyUrl = (endpoint: string): string => {
  const proxy = getSelectedProxy();
  const targetUrl = `https://api.notion.com/v1${endpoint}`;
  return `${proxy}${encodeURIComponent(targetUrl)}`;
};

/**
 * Réinitialise le cache du proxy
 */
export const resetProxyCache = (): void => {
  // Effacer la dernière erreur
  localStorage.removeItem('notion_last_error');
  console.log('Cache du proxy réinitialisé');
};

/**
 * Recherche un proxy CORS fonctionnel
 */
export const findWorkingProxy = async (): Promise<string | null> => {
  console.log('Recherche d\'un proxy CORS fonctionnel...');
  
  // Récupérer la clé API pour le test si disponible
  const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  
  for (const proxy of PUBLIC_CORS_PROXIES) {
    console.log(`Test du proxy: ${proxy}`);
    try {
      const testUrl = `${proxy}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${apiKey || 'test_token'}`,
          'Notion-Version': NOTION_API_VERSION
        }
      });
      
      // Même un 401 est bon - cela signifie que nous avons atteint l'API Notion
      const isWorking = response.status !== 0 && response.status !== 404;
      
      console.log(`CORS Proxy test result for ${proxy}: ${isWorking ? 'SUCCESS' : 'FAILED'} (status: ${response.status})`);
      
      if (isWorking) {
        setSelectedProxy(proxy);
        return proxy;
      }
    } catch (error) {
      console.error(`Failed to test proxy ${proxy}:`, error);
    }
  }
  
  console.error('No working proxy found!');
  return null;
};

/**
 * Vérifie si le déploiement du proxy est opérationnel
 */
export const verifyProxyDeployment = async (showSuccess = false, customApiKey?: string): Promise<boolean> => {
  const deploymentType = getDeploymentType();
  const apiUrl = deploymentType === 'netlify' ? '/.netlify/functions/ping' : '/api/ping';
  const apiProxyUrl = getServerlessProxyUrl();
  console.log(`Vérification du déploiement du proxy: ${apiUrl} / ${apiProxyUrl}`);
  
  try {
    // D'abord, tester le ping simple
    console.log(`Tentative de ping: ${apiUrl}`);
    const pingResponse = await fetch(apiUrl);
    
    if (!pingResponse.ok) {
      console.warn(`Le ping a échoué avec le statut: ${pingResponse.status}`);
    } else {
      console.log(`Ping réussi: ${apiUrl}`);
    }
    
    // Ensuite, tester le proxy Notion lui-même
    console.log(`Tentative de post vers le proxy: ${apiProxyUrl}`);
    
    // Utiliser la clé API personnalisée si fournie, sinon récupérer depuis localStorage
    const apiKey = customApiKey || localStorage.getItem(STORAGE_KEYS.API_KEY);
    console.log(`Using API key for test: ${apiKey ? `${apiKey.substring(0, 8)}...` : 'none'}`);
    
    const notionProxyResponse = await fetch(apiProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/users/me',
        method: 'GET',
        token: apiKey || 'test_token'
      })
    });
    
    // Même un 401 est bon - cela signifie que le proxy fonctionne mais que l'API key est invalide
    const proxyWorks = notionProxyResponse.status !== 404 && notionProxyResponse.status !== 0;
    
    console.log(`Proxy test result: ${proxyWorks ? 'SUCCESS' : 'FAILED'} (status: ${notionProxyResponse.status})`);
    
    if (proxyWorks && showSuccess) {
      toast.success('Proxy Notion opérationnel', {
        description: 'Le proxy pour les requêtes Notion est correctement déployé.'
      });
    }
    
    return proxyWorks;
  } catch (error) {
    console.error('Error testing proxy deployment:', error);
    return false;
  }
};
