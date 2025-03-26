
/**
 * Module de proxy de secours pour l'API Notion
 * 
 * Ce module fournit une alternative au proxy Vercel en utilisant
 * un service CORS public pour contourner les limitations CORS.
 */

import { toast } from 'sonner';

// Options de configuration
const CONFIG = {
  // Services CORS publics (si un ne fonctionne pas, nous essaierons le suivant)
  CORS_PROXIES: [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ],
  // URL de base de l'API Notion
  NOTION_API_BASE: 'https://api.notion.com/v1',
  // Version de l'API Notion
  NOTION_API_VERSION: '2022-06-28',
  // Délai avant timeout (en ms)
  TIMEOUT_MS: 15000,
};

/**
 * Prépare l'URL de l'API Notion complète
 */
const prepareNotionUrl = (endpoint: string): string => {
  // S'assurer que l'endpoint commence par un slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construire l'URL complète
  return `${CONFIG.NOTION_API_BASE}${formattedEndpoint}`;
};

/**
 * Trouve un proxy CORS qui fonctionne
 * @returns URL du proxy fonctionnel ou null si aucun ne fonctionne
 */
export const findWorkingCorsProxy = async (): Promise<string | null> => {
  for (const proxyUrl of CONFIG.CORS_PROXIES) {
    try {
      // Test simple avec une requête de ping à l'API Notion
      const testUrl = `${proxyUrl}${CONFIG.NOTION_API_BASE}/users/me`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      // Si le proxy répond, même avec une erreur d'authentification, c'est bon
      if (response.status === 401 || response.ok) {
        console.log(`✅ Proxy CORS trouvé: ${proxyUrl}`);
        return proxyUrl;
      }
    } catch (error) {
      console.log(`❌ Proxy CORS non disponible: ${proxyUrl}`, error.message);
    }
  }
  
  return null;
};

/**
 * Cache pour stocker le proxy fonctionnel
 */
let cachedWorkingProxy: string | null = null;

/**
 * Effectue une requête via le proxy CORS public
 */
export const fallbackNotionRequest = async (
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  try {
    // Récupérer la clé API
    const token = apiKey || localStorage.getItem('notion_api_key');
    if (!token) {
      throw new Error('Clé API Notion introuvable');
    }
    
    // Trouver un proxy CORS qui fonctionne (ou utiliser celui en cache)
    if (!cachedWorkingProxy) {
      cachedWorkingProxy = await findWorkingCorsProxy();
      if (!cachedWorkingProxy) {
        throw new Error('Aucun proxy CORS public disponible');
      }
    }
    
    // Préparer l'URL complète
    const notionUrl = prepareNotionUrl(endpoint);
    const proxyUrl = `${cachedWorkingProxy}${notionUrl}`;
    
    // Préparer les options de la requête
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': CONFIG.NOTION_API_VERSION,
        'Authorization': `Bearer ${token}`
      },
      body: options.body
    };
    
    console.log(`🔄 Utilisation du proxy CORS alternatif: ${cachedWorkingProxy}`);
    
    // Configurer un timeout pour la requête
    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
    
    // Effectuer la requête
    const response = await fetch(proxyUrl, fetchOptions);
    clearTimeout(timeoutId);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Notion: ${response.status} - ${errorText}`);
    }
    
    // Traiter la réponse JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur proxy CORS alternatif:', error);
    
    // Si le proxy CORS échoue, on le réinitialise pour la prochaine tentative
    if (error.message.includes('Aucun proxy CORS') || error.name === 'AbortError') {
      cachedWorkingProxy = null;
    }
    
    toast.error('Erreur du proxy alternatif', {
      description: `${error.message}. Essayez de rafraîchir la page ou un autre proxy.`,
    });
    
    throw error;
  }
};

/**
 * Réinitialise le cache du proxy
 */
export const resetCorsProxyCache = () => {
  cachedWorkingProxy = null;
};
