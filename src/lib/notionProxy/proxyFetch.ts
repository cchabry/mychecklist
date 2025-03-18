
import { toast } from 'sonner';
import { 
  NOTION_API_BASE, 
  VERCEL_PROXY_URL, 
  NOTION_API_VERSION, 
  REQUEST_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  STORAGE_KEYS
} from './config';

/**
 * Récupère la clé API depuis les paramètres ou localStorage
 */
const getNotionToken = (apiKey?: string): string => {
  const token = apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY);
  
  if (!token) {
    throw new Error('Clé API Notion introuvable');
  }
  
  return token;
};

/**
 * Vérifie si l'URL du proxy est correctement configurée
 */
const validateProxyUrl = (): void => {
  if (!VERCEL_PROXY_URL || !VERCEL_PROXY_URL.startsWith('https://')) {
    console.warn('⚠️ URL du proxy mal configurée:', VERCEL_PROXY_URL);
    toast.error('Configuration du proxy incorrecte', {
      description: 'L\'URL du proxy Vercel n\'est pas correctement configurée',
    });
    throw new Error('URL du proxy Vercel invalide');
  }
  console.log(`🔄 Utilisation du proxy Vercel: ${VERCEL_PROXY_URL}`);
};

/**
 * Prépare les données pour l'envoi au proxy
 */
const prepareProxyData = (endpoint: string, options: RequestInit, token: string) => {
  const proxyData = {
    endpoint,
    method: options.method || 'GET',
    token,
    body: options.body ? JSON.parse(options.body as string) : undefined
  };
  
  console.log('📦 Données envoyées au proxy:', {
    endpoint: proxyData.endpoint,
    method: proxyData.method,
    hasToken: !!proxyData.token,
    hasBody: !!proxyData.body
  });
  
  return proxyData;
};

/**
 * Crée les options de requête optimisées pour le proxy
 */
const createProxyRequestOptions = (proxyData: any, controller: AbortController): RequestInit => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(proxyData),
    signal: controller.signal,
    cache: 'no-store',
    mode: 'cors',
    credentials: 'omit'
  };
};

/**
 * Calcul du délai pour le backoff exponentiel
 */
const calculateBackoffDelay = (retryCount: number): number => {
  return Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
};

/**
 * Effectue un test de ping sur le proxy pour vérifier son accessibilité
 */
const pingProxyServer = async (): Promise<void> => {
  try {
    const pingUrl = `${VERCEL_PROXY_URL.split('/api/')[0]}/api/ping`;
    console.log(`📡 Test de ping du proxy: ${pingUrl}`);
    
    const pingResponse = await fetch(pingUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    console.log('📡 Ping du proxy réussi:', pingResponse.status);
    toast.error('Erreur de communication avec le proxy', {
      description: 'Le proxy est accessible mais ne répond pas correctement aux requêtes Notion',
    });
  } catch (pingError) {
    console.error('📡 Échec du ping au proxy:', pingError);
    toast.error('Proxy inaccessible', {
      description: 'Impossible de contacter le proxy Vercel. Vérifiez le déploiement et l\'URL.',
    });
  }
};

/**
 * Parse la réponse du proxy
 */
const parseProxyResponse = async (response: Response): Promise<any> => {
  // Obtenir le texte brut de la réponse
  const responseText = await response.text();
  
  // Tenter de parser la réponse JSON
  try {
    const result = JSON.parse(responseText);
    console.log('✅ Réponse JSON parsée avec succès');
    
    // Si la réponse contient une erreur explicite
    if (result.error) {
      console.error('❌ Erreur retournée par le proxy:', result.error);
      throw new Error(result.error);
    }
    
    return result;
  } catch (parseError) {
    console.error('❌ Erreur lors du parsing de la réponse:', parseError);
    throw new Error(`Erreur de format de réponse: ${responseText.substring(0, 100)}...`);
  }
};

/**
 * Effectue une seule tentative d'appel au proxy
 */
const makeProxyAttempt = async (
  proxyData: any, 
  controller: AbortController, 
  retryCount: number
): Promise<any> => {
  // Afficher un message pour les tentatives suivantes
  if (retryCount > 0) {
    console.log(`🔄 Tentative ${retryCount + 1}/${MAX_RETRY_ATTEMPTS} d'appel au proxy...`);
    
    // Attendre un peu plus longtemps entre chaque tentative (backoff exponentiel)
    const delayMs = calculateBackoffDelay(retryCount);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  // Créer les options de requête optimisées
  const requestOptions = createProxyRequestOptions(proxyData, controller);
  
  // Appeler le proxy Vercel
  const response = await fetch(VERCEL_PROXY_URL, requestOptions);
  
  // Vérifier le statut HTTP de la réponse
  if (!response.ok) {
    console.warn(`❌ Erreur HTTP du proxy: ${response.status} ${response.statusText}`);
    
    // Pour les erreurs 500+, on va retenter
    if (response.status >= 500) {
      throw new Error(`Erreur serveur proxy: ${response.status}`);
    }
  }
  
  console.log(`📥 Réponse du proxy reçue: ${response.status} ${response.statusText}`);
  
  // Parser et retourner la réponse
  return await parseProxyResponse(response);
};

/**
 * Effectue l'appel au proxy avec une logique de retry
 */
const callProxyWithRetry = async (
  endpoint: string, 
  options: RequestInit, 
  token: string
): Promise<any> => {
  // Vérifier la configuration du proxy
  validateProxyUrl();
  
  // Préparer les données pour le proxy
  const proxyData = prepareProxyData(endpoint, options, token);
  
  // Ajouter un timeout à la requête
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    // Ajouter une logique de retry pour le proxy
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < MAX_RETRY_ATTEMPTS) {
      try {
        const result = await makeProxyAttempt(proxyData, controller, retryCount);
        clearTimeout(timeoutId);
        return result;
      } catch (attemptError) {
        lastError = attemptError;
        console.warn(`❌ Erreur lors de la tentative ${retryCount + 1}:`, attemptError);
        
        // Si c'est une erreur d'abort (timeout), on arrête les tentatives
        if (attemptError.name === 'AbortError') {
          console.error('⏱️ Timeout lors de l\'appel au proxy');
          break;
        }
        
        retryCount++;
      }
    }
    
    // Si toutes les tentatives ont échoué
    console.error('❌ Échec de toutes les tentatives de connexion au proxy');
    
    // Vérifier si le proxy est accessible via un ping simple
    await pingProxyServer();
    
    // Lancer l'erreur originale
    throw lastError || new Error('Échec de la communication avec le proxy Notion');
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Fonction principale pour effectuer des requêtes à l'API Notion (directement ou via proxy)
 */
export const notionApiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  try {
    // Récupérer la clé API
    const token = getNotionToken(apiKey);
    
    // Appeler le proxy avec une logique de retry
    return await callProxyWithRetry(endpoint, options, token);
  } catch (proxyError) {
    console.error('💥 Erreur proxy globale:', proxyError);
    
    // Gérer l'erreur CORS explicitement
    if (proxyError.message?.includes('Failed to fetch')) {
      const corsError = new Error('Failed to fetch - Limitation CORS');
      toast.error('Erreur CORS détectée', {
        description: 'Le navigateur bloque les requêtes cross-origin. Utilisez le proxy Vercel correctement configuré.',
      });
      throw corsError;
    }
    
    throw proxyError;
  }
};
