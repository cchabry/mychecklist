
import { mockNotionResponse } from './mockData';
import { NOTION_API_VERSION, REQUEST_TIMEOUT_MS, MAX_RETRY_ATTEMPTS } from './config';
import { corsProxy } from '@/services/corsProxy'; // Changed import to use the new path
import { mockMode } from './mockMode';
import { storeNotionError, clearStoredNotionErrors, extractNotionErrorMessage } from './errorHandling';

// Types pour plus de clarté
interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// Variables de statut
let _usingServerlessProxy = false;

/**
 * Tente une requête via le proxy serverless (Vercel/Netlify)
 */
async function tryServerlessProxy<T>(
  endpoint: string,
  method: string,
  body?: any,
  token?: string,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const deploymentType = window.location.hostname.includes('netlify') ? 'netlify' : 'vercel';
  const proxyUrl = deploymentType === 'netlify' 
    ? '/.netlify/functions/notion-proxy' 
    : '/api/notion-proxy';
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify({
        endpoint,
        method,
        body,
        token
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = extractNotionErrorMessage(response.status, errorData);
      throw new Error(errorMessage);
    }
    
    _usingServerlessProxy = true;
    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Tente une requête via le proxy CORS côté client
 */
async function tryClientProxy<T>(
  endpoint: string,
  method: string,
  token: string,
  body?: any, 
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const proxyUrl = corsProxy.buildProxyUrl(endpoint); // Use corsProxy instead of corsProxyService
  
  const headers: Record<string, string> = {
    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  const requestOptions: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };
  
  // Add timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  requestOptions.signal = controller.signal;
  
  try {
    const response = await fetch(proxyUrl, requestOptions);
    clearTimeout(id);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = extractNotionErrorMessage(response.status, errorData);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`La requête a expiré après ${REQUEST_TIMEOUT_MS/1000} secondes`);
    }
    throw error;
  }
}

/**
 * Fonction principale pour les requêtes Notion
 */
export const notionApiRequest = async <T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string,
  customHeaders: Record<string, string> = {}
): Promise<T> => {
  // Récupérer le token depuis localStorage si non fourni
  if (!token) {
    token = localStorage.getItem('notion_api_key') || '';
  }
  
  if (!token) {
    throw new Error('Clé API Notion manquante. Veuillez configurer votre clé API dans les paramètres.');
  }
  
  // Vérifier le mode mock
  if (mockMode.isActive()) {
    return mockNotionResponse(endpoint, method, body) as T;
  }
  
  // Tenter d'abord le proxy serverless si on n'est pas en local
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost) {
    try {
      const result = await tryServerlessProxy<T>(endpoint, method, body, token, customHeaders);
      
      // Nettoyer les erreurs précédentes
      clearStoredNotionErrors();
      
      return result;
    } catch (serverlessError) {
      // Si l'erreur est d'authentification, la propager directement
      if (serverlessError.message?.includes('authentification') || 
          serverlessError.message?.includes('401')) {
        throw serverlessError;
      }
      
      // Continuer avec le proxy client
    }
  }
  
  // Si le proxy serverless a échoué ou si on est en local, essayer le proxy client
  try {
    const result = await tryClientProxy<T>(endpoint, method, token, body, customHeaders);
    
    // Nettoyer les erreurs précédentes
    clearStoredNotionErrors();
    
    return result;
  } catch (clientProxyError) {
    // Si c'est une erreur CORS "Failed to fetch", essayer de trouver un autre proxy
    if (clientProxyError.message?.includes('fetch')) {
      try {
        // Chercher un proxy fonctionnel
        const newProxy = await corsProxy.findWorkingProxy(token); // Use corsProxy instead of corsProxyService
        
        if (newProxy) {
          // Réessayer avec le nouveau proxy
          return await tryClientProxy<T>(endpoint, method, token, body, customHeaders);
        }
      } catch (proxyError) {
        // Ignorer l'erreur de recherche de proxy
      }
    }
    
    // Stocker l'erreur
    storeNotionError(clientProxyError, endpoint);
    
    throw clientProxyError;
  }
};
