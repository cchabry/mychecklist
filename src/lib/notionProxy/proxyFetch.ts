import { toast } from 'sonner';
import { 
  NOTION_API_BASE, 
  VERCEL_PROXY_URL, 
  NOTION_API_VERSION, 
  REQUEST_TIMEOUT_MS,
  MAX_RETRY_ATTEMPTS,
  STORAGE_KEYS,
  isProxyUrlValid,
  getValidProxyUrl
} from './config';
import { fallbackNotionRequest, resetCorsProxyCache } from './fallbackProxy';

// Variable globale pour suivre l'état de la dernière erreur
const proxyStatus = {
  lastError: null,
  proxyFound: false,
  pingSuccessful: false,
  postSuccessful: false,
  usingFallbackProxy: false
};

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
const validateProxyUrl = async (): Promise<string> => {
  try {
    // Essayer d'obtenir une URL de proxy valide dynamiquement
    const proxyUrl = await getValidProxyUrl();
    console.log(`🔄 Utilisation du proxy Vercel: ${proxyUrl}`);
    return proxyUrl;
  } catch (error) {
    console.warn('⚠️ URL du proxy mal configurée:', VERCEL_PROXY_URL);
    toast.error('Configuration du proxy incorrecte', {
      description: 'L\'URL du proxy Vercel n\'est pas correctement configurée',
    });
    throw new Error('URL du proxy Vercel invalide');
  }
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
 * Test complet de la configuration du proxy
 * Cette méthode effectue plusieurs tests pour déterminer précisément où se trouve le problème
 */
const runProxyDiagnostic = async (): Promise<{
  pingOk: boolean;
  headOk: boolean;
  postOk: boolean;
  message: string;
}> => {
  const result = {
    pingOk: false,
    headOk: false,
    postOk: false,
    message: 'Diagnostic incomplet'
  };
  
  try {
    // Test 1: Ping API
    const pingUrl = `${window.location.origin}/api/ping`;
    try {
      const pingResponse = await fetch(pingUrl, {
        method: 'GET',
        cache: 'no-store'
      });
      
      result.pingOk = pingResponse.ok;
      if (!result.pingOk) {
        result.message = `API Vercel inaccessible (${pingResponse.status})`;
        return result;
      }
    } catch (pingError) {
      result.message = `Erreur lors du ping API: ${pingError.message}`;
      return result;
    }
    
    // Test 2: HEAD request sur le proxy
    const proxyUrl = `${window.location.origin}/api/notion-proxy`;
    try {
      const headResponse = await fetch(proxyUrl, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      // Même un 404 est considéré comme "OK" pour un HEAD car ça signifie que l'URL existe
      result.headOk = headResponse.status !== 404;
      if (!result.headOk) {
        result.message = 'Le fichier api/notion-proxy.ts est introuvable (404)';
        return result;
      }
    } catch (headError) {
      // Si on a une erreur CORS, on considère quand même que le fichier existe
      result.headOk = true;
      console.log('HEAD proxy request resulted in error (could be CORS):', headError.message);
    }
    
    // Test 3: POST request sur le proxy (le vrai test)
    try {
      const postResponse = await fetch(proxyUrl, {
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
      
      result.postOk = postResponse.status !== 404;
      if (!result.postOk) {
        result.message = 'Le proxy ne répond pas aux requêtes POST (404)';
        return result;
      } else if (!postResponse.ok) {
        result.message = `Le proxy répond avec une erreur: ${postResponse.status}`;
        return result;
      }
    } catch (postError) {
      result.message = `Erreur lors de la requête POST au proxy: ${postError.message}`;
      return result;
    }
    
    // Si on arrive ici, tout a réussi
    result.message = 'Proxy accessible et fonctionnel';
    return result;
  } catch (error) {
    result.message = `Erreur lors du diagnostic: ${error.message}`;
    return result;
  }
};

/**
 * Vérification de l'existence du fichier proxy par une requête directe
 */
const checkProxyExists = async (): Promise<boolean> => {
  try {
    // Diagnostiquer le proxy
    const diagnostic = await runProxyDiagnostic();
    
    // Mettre à jour l'état global du proxy
    proxyStatus.pingSuccessful = diagnostic.pingOk;
    proxyStatus.proxyFound = diagnostic.headOk;
    proxyStatus.postSuccessful = diagnostic.postOk;
    
    console.log('📊 Diagnostic du proxy:', diagnostic);
    
    if (!diagnostic.pingOk) {
      console.error('❌ L\'API Vercel est inaccessible');
      toast.error('API Vercel inaccessible', {
        description: 'Vérifiez votre déploiement Vercel et sa configuration.',
      });
      return false;
    }
    
    if (!diagnostic.headOk) {
      console.error('❌ Le fichier api/notion-proxy n\'existe pas (404)');
      toast.error('Fichier proxy manquant', {
        description: 'Le fichier api/notion-proxy.ts est introuvable sur le serveur Vercel.',
      });
      return false;
    }
    
    if (!diagnostic.postOk) {
      console.error('❌ Le proxy ne répond pas aux requêtes POST');
      toast.error('Proxy mal configuré', {
        description: 'Le fichier proxy existe mais ne répond pas correctement aux requêtes.',
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('❓ Vérification du proxy échouée:', error);
    toast.error('Impossible de vérifier le proxy', {
      description: 'Le fichier api/notion-proxy.ts est peut-être mal configuré.',
    });
    return false;
  }
};

/**
 * Effectue un test de ping sur le proxy pour vérifier son accessibilité
 */
const pingProxyServer = async (): Promise<void> => {
  try {
    // Vérifier d'abord si le fichier d'API existe
    const proxyExists = await checkProxyExists();
    if (!proxyExists) {
      toast.error('Problème avec le proxy Notion', {
        description: 'Vérifiez que le fichier api/notion-proxy.ts est bien déployé et configuré sur Vercel.',
      });
      return;
    }
    
    console.log('✅ Proxy Notion accessible');
  } catch (pingError) {
    console.error('📡 Échec du diagnostic du proxy:', pingError);
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
  
  // Si la réponse est vide, erreur
  if (!responseText || responseText.trim() === '') {
    console.error('❌ Réponse vide du proxy');
    throw new Error('Réponse vide du proxy');
  }
  
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
    // Limiter le texte affiché pour éviter de saturer la console
    const preview = responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '');
    throw new Error(`Erreur de format de réponse: ${preview}`);
  }
};

/**
 * Effectue une seule tentative d'appel au proxy
 */
const makeProxyAttempt = async (
  proxyUrl: string,
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
  const response = await fetch(proxyUrl, requestOptions);
  
  // Vérifier le statut HTTP de la réponse
  if (!response.ok) {
    console.warn(`❌ Erreur HTTP du proxy: ${response.status} ${response.statusText}`);
    
    // Mettre à jour l'état de la dernière erreur
    proxyStatus.lastError = {
      status: response.status,
      message: response.statusText
    };
    
    // Pour l'erreur 404, on affiche un message spécifique
    if (response.status === 404) {
      // Une erreur 404 sur une requête POST est différente d'une 404 sur HEAD/GET
      // Cela suggère que le fichier existe mais que le gestionnaire ne répond pas
      throw new Error(`Endpoint du proxy introuvable (404). Vérifiez que api/notion-proxy.ts est correctement implémenté.`);
    }
    
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
  // Vérifier la configuration du proxy et obtenir l'URL valide
  const proxyUrl = await validateProxyUrl();
  
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
        const result = await makeProxyAttempt(proxyUrl, proxyData, controller, retryCount);
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
        
        // Si c'est une erreur 404, on arrête aussi les tentatives
        if (attemptError.message && attemptError.message.includes('404')) {
          console.error('🚫 Endpoint proxy non trouvé (404)');
          break;
        }
        
        retryCount++;
      }
    }
    
    // Si toutes les tentatives ont échoué
    console.error('❌ Échec de toutes les tentatives de connexion au proxy');
    
    // Vérifier si le proxy est accessible via un diagnostic
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
    
    // Essayer d'abord avec le proxy Vercel
    try {
      // Appeler le proxy avec une logique de retry
      const result = await callProxyWithRetry(endpoint, options, token);
      proxyStatus.usingFallbackProxy = false;
      return result;
    } catch (proxyError) {
      console.warn('⚠️ Échec du proxy Vercel, passage au proxy alternatif', proxyError);
      
      // Si le proxy Vercel échoue, essayer le proxy alternatif
      toast.info('Utilisation du proxy CORS alternatif', {
        description: 'Le proxy Vercel ne répond pas, nous essayons une méthode alternative.'
      });
      
      proxyStatus.usingFallbackProxy = true;
      
      // Utiliser le proxy CORS public comme solution de repli
      return await fallbackNotionRequest(endpoint, options, token);
    }
  } catch (error) {
    console.error('💥 Erreur proxy globale:', error);
    
    // Gérer l'erreur CORS explicitement
    if (error.message?.includes('Failed to fetch')) {
      const corsError = new Error('Failed to fetch - Limitation CORS');
      toast.error('Erreur CORS détectée', {
        description: 'Le navigateur bloque les requêtes cross-origin. Nous avons essayé plusieurs solutions de proxy sans succès.',
      });
      throw corsError;
    }
    
    // Conserver l'état de la dernière erreur pour diagnostic
    proxyStatus.lastError = {
      message: error.message,
      stack: error.stack
    };
    
    throw error;
  }
};

// Exporter l'état du proxy pour diagnostic
export const getProxyStatus = () => ({ 
  ...proxyStatus,
  // Ajouter l'information d'utilisation du proxy de secours
  usingFallbackProxy: proxyStatus.usingFallbackProxy 
});

// Réinitialiser tous les caches de proxy
export const resetAllProxyCaches = () => {
  resetCorsProxyCache();
}
