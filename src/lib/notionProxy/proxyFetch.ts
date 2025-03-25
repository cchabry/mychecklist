
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';
import { corsProxy } from '@/services/corsProxy';
import { 
  getDeploymentType, 
  isNetlifyDeployment, 
  isLovablePreview,
  isDeploymentDebuggingEnabled,
  NOTION_API_VERSION,
  NOTION_API_BASE
} from './config';

/**
 * Utilitaire pour normaliser un endpoint Notion
 */
const normalizeEndpoint = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // S'assurer que l'endpoint commence par un slash
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }
  
  // S'assurer que l'endpoint commence par /v1/
  if (!endpoint.startsWith('/v1/')) {
    endpoint = '/v1' + endpoint;
  }
  
  return endpoint;
};

/**
 * Fonction utilitaire pour effectuer des requêtes à l'API Notion via un proxy
 * @param endpoint Point d'accès de l'API Notion (relatif)
 * @param method Méthode HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param body Corps de la requête (optionnel)
 * @param token Jeton d'authentification Notion (optionnel, pris du localStorage par défaut)
 * @returns Promesse contenant la réponse JSON
 */
export const notionApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> => {
  // Log de débogage pour le type de déploiement
  const deploymentType = getDeploymentType();
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  console.log(`🔍 [${requestId}] Requête API Notion - Début`, {
    endpoint,
    method,
    deploymentType,
    isDemoMode: operationMode.isDemoMode,
    timestamp: new Date().toISOString()
  });

  // Normaliser l'endpoint pour garantir le format correct
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Vérifier si nous sommes en mode démo simulé
  if (operationMode.isDemoMode) {
    // Simuler un délai réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire selon le taux configuré
    if (operationModeUtils.shouldSimulateError()) {
      console.log(`🔍 [${requestId}] Mode démo - Erreur simulée pour ${normalizedEndpoint}`);
      throw new Error(`Erreur simulée lors de l'appel à ${normalizedEndpoint}`);
    }
    
    // En mode démo, on devrait normalement utiliser les données mock au lieu d'appeler cette fonction
    console.warn(`🔍 [${requestId}] notionApiRequest appelé en mode démo pour ${normalizedEndpoint}. Utiliser les données mock directement.`);
    
    // Retourner un résultat fictif générique
    return { success: true, message: "Opération simulée avec succès" };
  }
  
  // Récupérer le token d'authentification si non fourni
  const authToken = token || localStorage.getItem('notion_api_key');
  
  if (!authToken) {
    console.error(`🔍 [${requestId}] Erreur: Token Notion manquant`);
    throw new Error('Token Notion manquant');
  }
  
  // Formater correctement le token pour l'API Notion
  let formattedToken = authToken;
  if (!formattedToken.startsWith('Bearer ')) {
    if (formattedToken.startsWith('secret_') || formattedToken.startsWith('ntn_')) {
      formattedToken = `Bearer ${formattedToken}`;
    }
  }
  
  try {
    console.log(`🔍 [${requestId}] Tentative d'accès à l'API Notion:`, {
      endpoint: normalizedEndpoint,
      method,
      tokenType: formattedToken.startsWith('Bearer secret_') ? 'Integration' : 
                 formattedToken.startsWith('Bearer ntn_') ? 'OAuth' : 'Inconnu',
      hasBody: !!body
    });
    
    // Stratégies d'accès à l'API Notion, essayées dans cet ordre:
    let result = null;
    let usedStrategy = '';
    let error = null;
    
    // 1. Essayer les fonctions serverless (Netlify ou Vercel)
    try {
      console.log(`🔍 [${requestId}] Stratégie 1: Fonctions serverless`);
      if (isNetlifyDeployment()) {
        console.log(`🔍 [${requestId}] Utilisation des fonctions Netlify`);
        result = await useNetlifyProxy(normalizedEndpoint, method, body, formattedToken);
        usedStrategy = 'netlify';
      } else {
        console.log(`🔍 [${requestId}] Utilisation des fonctions serverless génériques`);
        result = await useServerlessProxy(normalizedEndpoint, method, body, formattedToken);
        usedStrategy = 'serverless';
      }
      console.log(`🔍 [${requestId}] Stratégie 1 réussie: ${usedStrategy}`);
    } catch (err) {
      error = err;
      console.warn(`🔍 [${requestId}] Stratégie 1 échouée:`, {
        stratégie: isNetlifyDeployment() ? 'netlify' : 'serverless',
        erreur: err.message
      });
      
      // 2. Essayer le proxy CORS
      try {
        console.log(`🔍 [${requestId}] Stratégie 2: Proxy CORS public`);
        result = await useCorsProxy(normalizedEndpoint, method, body, formattedToken);
        usedStrategy = 'cors-proxy';
        console.log(`🔍 [${requestId}] Stratégie 2 réussie: proxy CORS`);
        // Réinitialiser l'erreur car nous avons réussi
        error = null;
      } catch (corsErr) {
        console.warn(`🔍 [${requestId}] Stratégie 2 échouée:`, {
          stratégie: 'cors-proxy',
          erreur: corsErr.message,
          proxy: corsProxy.getCurrentProxy()?.url || 'aucun'
        });
        
        // Si l'erreur CORS est un 403, la conserver car elle est probablement plus précise
        if (corsErr.message.includes('403')) {
          error = corsErr;
        }
        
        // 3. Tentative directe (qui échouera probablement à cause de CORS)
        try {
          console.log(`🔍 [${requestId}] Stratégie 3: Appel direct (dernière chance)`);
          result = await useDirectRequest(normalizedEndpoint, method, body, formattedToken);
          usedStrategy = 'direct';
          console.log(`🔍 [${requestId}] Stratégie 3 réussie: appel direct`);
          // Réinitialiser l'erreur car nous avons réussi
          error = null;
        } catch (directErr) {
          console.warn(`🔍 [${requestId}] Stratégie 3 échouée:`, {
            stratégie: 'direct',
            erreur: directErr.message
          });
          
          // Si nous n'avons pas déjà une erreur 403, utiliser cette erreur
          if (!error || !error.message.includes('403')) {
            error = directErr;
          }
        }
      }
    }
    
    // Si toutes les stratégies ont échoué, lancer l'erreur
    if (error) {
      throw error;
    }
    
    // Calculer le temps de réponse
    const responseTime = Date.now() - startTime;
    
    console.log(`🔍 [${requestId}] Requête API Notion - Succès`, {
      stratégie: usedStrategy,
      temps: `${responseTime}ms`,
      endpoint: normalizedEndpoint
    });
    
    // Signaler au système de mode opérationnel que l'opération a réussi
    operationMode.handleSuccessfulOperation();
    
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error(`🔍 [${requestId}] Requête API Notion - Échec`, {
      temps: `${responseTime}ms`,
      endpoint: normalizedEndpoint,
      erreur: error.message
    });
    
    // Signaler l'erreur au système de mode opérationnel
    operationMode.handleConnectionError(error, `notionApiRequest: ${normalizedEndpoint}`);
    
    // Lancer une erreur formatée pour indiquer clairement la nature du problème
    throw new Error(`Erreur API Notion (${normalizedEndpoint}): ${error.message}`);
  }
};

/**
 * Utilise les fonctions Netlify pour accéder à l'API Notion
 */
const useNetlifyProxy = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🔍 [${requestId}] useNetlifyProxy - Début`, { endpoint, method });
  
  const response = await fetch('/.netlify/functions/notion-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      method,
      body,
      token
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`🔍 [${requestId}] useNetlifyProxy - Erreur ${response.status}:`, errorText);
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`🔍 [${requestId}] useNetlifyProxy - Succès`);
  return data;
};

/**
 * Utilise les fonctions serverless génériques pour accéder à l'API Notion
 */
const useServerlessProxy = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🔍 [${requestId}] useServerlessProxy - Début`, { endpoint, method });
  
  const response = await fetch('/api/notion-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      method,
      body,
      token
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`🔍 [${requestId}] useServerlessProxy - Erreur ${response.status}:`, errorText);
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`🔍 [${requestId}] useServerlessProxy - Succès`);
  return data;
};

/**
 * Utilise un proxy CORS public pour accéder à l'API Notion
 */
const useCorsProxy = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  // Obtenir le proxy actuel
  const currentProxy = corsProxy.getCurrentProxy();
  
  if (!currentProxy) {
    console.error(`🔍 [${requestId}] useCorsProxy - Aucun proxy disponible`);
    throw new Error('Aucun proxy CORS disponible');
  }
  
  console.log(`🔍 [${requestId}] useCorsProxy - Début`, { 
    endpoint, 
    method, 
    proxy: currentProxy.url 
  });
  
  // Construire l'URL complète
  const targetUrl = `${NOTION_API_BASE}${endpoint}`;
  const proxyUrl = corsProxy.buildProxyUrl(targetUrl);
  
  console.log(`🔍 [${requestId}] useCorsProxy - URL complète: ${proxyUrl}`);
  
  // Préparer les options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_API_VERSION,
      'Authorization': token || ''
    }
  };
  
  // Ajouter le corps pour les méthodes autres que GET
  if (method !== 'GET' && body) {
    options.body = JSON.stringify(body);
  }
  
  // Effectuer la requête
  const response = await fetch(proxyUrl, options);
  
  // Vérifier si la réponse est OK
  if (!response.ok) {
    const statusText = response.statusText || '';
    console.error(`🔍 [${requestId}] useCorsProxy - Erreur ${response.status}: ${statusText}`);
    
    // Tenter de lire le corps de la réponse d'erreur
    let errorBody = '';
    try {
      errorBody = await response.text();
      console.error(`🔍 [${requestId}] useCorsProxy - Corps de l'erreur:`, errorBody);
    } catch (e) {
      console.error(`🔍 [${requestId}] useCorsProxy - Impossible de lire le corps de l'erreur`);
    }
    
    // En cas d'erreur 403, essayer de changer de proxy pour la prochaine fois
    if (response.status === 403) {
      console.warn(`🔍 [${requestId}] useCorsProxy - Erreur 403, rotation du proxy pour la prochaine requête`);
      corsProxy.rotateProxy();
    }
    
    throw new Error(`Erreur HTTP ${response.status} ${statusText ? `(${statusText})` : ''}`);
  }
  
  // Traiter la réponse
  const data = await response.json();
  console.log(`🔍 [${requestId}] useCorsProxy - Succès`);
  return data;
};

/**
 * Tentative d'accès direct à l'API Notion (échouera probablement à cause de CORS)
 * Mais gardé comme fallback et pour les tests
 */
const useDirectRequest = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🔍 [${requestId}] useDirectRequest - Début`, { endpoint, method });
  
  // Construire l'URL complète
  const url = `${NOTION_API_BASE}${endpoint}`;
  
  console.log(`🔍 [${requestId}] useDirectRequest - URL directe: ${url}`);
  
  // Préparer les options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_API_VERSION,
      'Authorization': token || ''
    },
    // Essayer avec credentials pour voir si ça aide avec CORS
    credentials: 'omit'
  };
  
  // Ajouter le corps pour les méthodes autres que GET
  if (method !== 'GET' && body) {
    options.body = JSON.stringify(body);
  }
  
  // Effectuer la requête
  try {
    const response = await fetch(url, options);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error(`🔍 [${requestId}] useDirectRequest - Erreur ${response.status}`);
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    // Traiter la réponse
    const data = await response.json();
    console.log(`🔍 [${requestId}] useDirectRequest - Succès`);
    return data;
  } catch (error) {
    console.error(`🔍 [${requestId}] useDirectRequest - Échec:`, error.message);
    
    // Améliorer le message d'erreur pour les problèmes CORS
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error(`Erreur CORS: L'accès direct à l'API Notion est bloqué par le navigateur`);
    }
    
    throw error;
  }
};
