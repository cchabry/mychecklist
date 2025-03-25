import { operationMode } from '@/services/operationMode';
import { corsProxy } from '@/services/corsProxy';
import { ApiRequestContext } from './types';
import { operationModeUtils } from '@/services/operationMode/operationModeUtils';
import { logError } from './errorHandling';

// Base URL de l'API Notion
const NOTION_API_BASE = 'https://api.notion.com/v1';

/**
 * Utiliser l'API Notion directement (sans proxy)
 */
const useDirectApi = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🔍 [${requestId}] useDirectApi - Appel direct à l'API Notion: ${endpoint}`);
  
  try {
    // Récupérer les en-têtes d'origine
    const originalHeaders = options.headers || {};
    
    // Ajouter les en-têtes Notion obligatoires
    const headersWithAuth = {
      ...originalHeaders,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
    
    // Récupérer l'API key depuis localStorage si non fournie
    if (!headersWithAuth['Authorization'] && token) {
      headersWithAuth['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // Construire les options de requête
    const requestOptions: RequestInit = {
      ...options,
      headers: headersWithAuth
    };
    
    // Effectuer la requête
    const response = await fetch(`${NOTION_API_BASE}${endpoint}`, requestOptions);
    
    console.log(`🔍 [${requestId}] useDirectApi - Statut de la réponse:`, response.status);
    
    return response;
  } catch (error) {
    console.error(`🔍 [${requestId}] useDirectApi - Erreur lors de la requête:`, error);
    throw error;
  }
};

/**
 * Utiliser le proxy CORS côté client
 */
const useCorsProxy = async (
  endpoint: string,
  options: RequestInit = {},
  context: ApiRequestContext
): Promise<Response> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  const token = localStorage.getItem('notion_api_key') || context.token;
  console.log(`🔍 [${requestId}] useCorsProxy - Appel via proxy CORS: ${endpoint}`);
  
  try {
    // Si on est en mode réel, utiliser le proxy CORS
    if (!operationModeUtils.isMockActive()) {
      // Si on est en mode démo, ne pas utiliser le proxy CORS
      if (operationMode.isDemoMode) {
        console.warn(`🔍 [${requestId}] useCorsProxy - Mode démo actif, requête directe à l'API`);
        return await useDirectApi(endpoint, options, token);
      }
      
      try {
        // Détecter si on travaille avec une URL complète ou un endpoint relatif
        const isFullUrl = endpoint.startsWith('http');
        
        let normalizedEndpoint = endpoint;
        if (!isFullUrl) {
          normalizedEndpoint = normalizedEndpoint.startsWith('/') 
            ? normalizedEndpoint 
            : `/${normalizedEndpoint}`;
        }
        
        // Récupérer le proxy actuel
        const currentProxy = corsProxy.getCurrentProxy();
        if (!currentProxy) {
          throw new Error('Aucun proxy CORS disponible');
        }
        
        // Construction de l'URL avec le proxy
        const targetUrl = `${NOTION_API_BASE}${normalizedEndpoint}`;
        const proxyUrl = corsProxy.buildProxyUrl(targetUrl);
        
        console.log(`🔍 [${requestId}] useCorsProxy - URL complète: ${proxyUrl}`);
        
        // Récupérer les en-têtes d'origine
        const originalHeaders = options.headers || {};
        
        // Ajouter les en-têtes Notion obligatoires
        const headersWithAuth = {
          ...originalHeaders,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        };
        
        // Récupérer l'API key depuis localStorage si non fournie
        if (!headersWithAuth['Authorization'] && token) {
          headersWithAuth['Authorization'] = token.startsWith('Bearer ') 
            ? token 
            : `Bearer ${token}`;
        }
        
        // Construire les options de requête
        const requestOptions: RequestInit = {
          ...options,
          headers: headersWithAuth
        };
        
        // Effectuer la requête à travers le proxy
        const response = await fetch(proxyUrl, requestOptions);
        
        console.log(`🔍 [${requestId}] useCorsProxy - Statut de la réponse:`, response.status);
        
        // Si la requête réussit, notifier le système d'opération
        if (response.ok) {
          operationMode.handleSuccessfulOperation();
        } 
        // Gérer les erreurs courantes
        else {
          const statusText = response.statusText;
          
          // En cas d'erreur 403, essayer de changer de proxy pour la prochaine fois
          if (response.status === 403) {
            console.warn(`🔍 [${requestId}] useCorsProxy - Erreur 403, rotation du proxy pour la prochaine requête`);
            corsProxy.rotateProxy();
          }
          
          throw new Error(`Erreur HTTP ${response.status} ${statusText ? `(${statusText})` : ''}`);
        }
        
        return response;
      } catch (error) {
        // En cas d'erreur, logger et rethrow
        logError(error, 'Erreur lors de la requête via proxy CORS');
        throw error;
      }
    }
    
    // En mode mock, simuler une réponse
    console.warn(`🔍 [${requestId}] useCorsProxy - Requête en mode mock`);
    return new Response(JSON.stringify({
      "object": "error",
      "status": 400,
      "code": "mocked_response",
      "message": "Réponse simulée en mode mock"
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // En cas d'erreur, logger et rethrow
    logError(error, 'Erreur globale lors de la requête proxy');
    throw error;
  }
};

/**
 * Requête à l'API Notion avec proxy
 */
export const notionApiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  context: ApiRequestContext = {}
): Promise<any> => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🔍 [${requestId}] notionApiRequest - Requête à l'API Notion: ${endpoint}`);
  
  try {
    // Utiliser le proxy CORS
    const response = await useCorsProxy(endpoint, options, context);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error(`🔍 [${requestId}] notionApiRequest - Erreur de réponse:`, response.status, response.statusText);
      
      // Tenter de lire le corps de la réponse pour plus d'informations
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        console.warn(`🔍 [${requestId}] notionApiRequest - Impossible de lire le corps de la réponse`);
      }
      
      // Lancer une erreur avec des détails
      throw new Error(`Erreur ${response.status}: ${response.statusText} ${errorBody ? JSON.stringify(errorBody) : ''}`);
    }
    
    // Parse la réponse JSON
    const data = await response.json();
    
    console.log(`🔍 [${requestId}] notionApiRequest - Réponse reçue:`, data);
    
    return data;
  } catch (error) {
    console.error(`🔍 [${requestId}] notionApiRequest - Erreur lors de la requête:`, error);
    throw error;
  }
};
