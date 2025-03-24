
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';
import { corsProxy } from '@/services/corsProxy';

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
  // Normaliser l'endpoint pour garantir le format correct
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Vérifier si nous sommes en mode démo simulé
  if (operationMode.isDemoMode) {
    // Simuler un délai réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire selon le taux configuré
    if (operationModeUtils.shouldSimulateError()) {
      throw new Error(`Erreur simulée lors de l'appel à ${normalizedEndpoint}`);
    }
    
    // En mode démo, on devrait normalement utiliser les données mock au lieu d'appeler cette fonction
    console.warn(`notionApiRequest appelé en mode démo pour ${normalizedEndpoint}. Utiliser les données mock directement.`);
    
    // Retourner un résultat fictif générique
    return { success: true, message: "Opération simulée avec succès" };
  }
  
  // Récupérer le token d'authentification si non fourni
  const authToken = token || localStorage.getItem('notion_api_key');
  
  if (!authToken) {
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
    // Essayer d'abord d'utiliser les fonctions serverless
    try {
      console.log('🔄 Tentative d\'utilisation des fonctions serverless pour:', normalizedEndpoint);
      return await useServerlessProxy(normalizedEndpoint, method, body, formattedToken);
    } catch (serverlessError) {
      console.log('⚠️ Fonctions serverless non disponibles, tentative d\'utilisation du proxy CORS:', serverlessError);
      
      // Si aucun proxy n'est configuré, essayer d'en trouver un automatiquement
      const currentProxy = corsProxy.getCurrentProxy();
      if (!currentProxy) {
        console.log('⚠️ Aucun proxy CORS configuré, recherche automatique...');
        await corsProxy.findWorkingProxy();
      }
      
      // Ensuite essayer d'utiliser le proxy CORS
      return await useCorsProxy(normalizedEndpoint, method, body, formattedToken);
    }
  } catch (error) {
    // En cas d'erreur, signaler au système operationMode
    operationMode.handleConnectionError(
      error instanceof Error ? error : new Error(String(error)),
      `notionApiRequest: ${normalizedEndpoint}`
    );
    
    // Propager l'erreur avec des informations utiles pour le débogage
    const errorMessage = error instanceof Error ? error.message : String(error);
    const enhancedError = new Error(`Erreur API Notion (${normalizedEndpoint}): ${errorMessage}`);
    throw enhancedError;
  }
};

/**
 * Normalise les endpoints pour garantir la cohérence
 * Cette fonction est cruciale pour résoudre les problèmes d'endpoints
 */
function normalizeEndpoint(endpoint: string): string {
  // Enlever les barres obliques de début et de fin pour la normalisation
  let cleanedEndpoint = endpoint.trim();
  
  // Gérer le cas spécial où l'endpoint est déjà complet avec /v1
  if (cleanedEndpoint.startsWith('/v1/')) {
    return cleanedEndpoint; // Déjà au bon format
  }
  
  // S'assurer que l'endpoint commence par une barre oblique
  if (!cleanedEndpoint.startsWith('/')) {
    cleanedEndpoint = '/' + cleanedEndpoint;
  }
  
  // Ajouter le préfixe /v1 si nécessaire (ce sera retiré pour serverless, mais gardé pour CORS)
  return `/v1${cleanedEndpoint}`;
}

/**
 * Utilise le proxy serverless (Vercel, Netlify) pour appeler l'API Notion
 */
async function useServerlessProxy(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  // Pour les fonctions serverless, on doit retirer le préfixe /v1
  const serverlessEndpoint = endpoint.startsWith('/v1/')
    ? endpoint.substring(3) // Enlever le /v1 car il sera ajouté par le proxy serverless
    : endpoint;
  
  console.log(`🔄 Préparation endpoint serverless: "${serverlessEndpoint}" (depuis "${endpoint}")`);
  
  // Essayer d'abord le proxy Vercel
  try {
    const vercelResponse = await fetch('/api/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: serverlessEndpoint,
        method,
        body,
        token
      })
    });
    
    if (!vercelResponse.ok) {
      const errorText = await vercelResponse.text();
      throw new Error(`Erreur du proxy Vercel: ${vercelResponse.status} ${errorText}`);
    }
    
    // Signaler une opération réussie au système operationMode
    operationMode.handleSuccessfulOperation();
    
    return vercelResponse.json();
  } catch (vercelError) {
    console.log('⚠️ Proxy Vercel non disponible, tentative d\'utilisation du proxy Netlify:', vercelError);
    
    // Ensuite essayer le proxy Netlify
    const netlifyResponse = await fetch('/.netlify/functions/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: serverlessEndpoint,
        method,
        body,
        token
      })
    });
    
    if (!netlifyResponse.ok) {
      const errorText = await netlifyResponse.text();
      throw new Error(`Erreur du proxy Netlify: ${netlifyResponse.status} ${errorText}`);
    }
    
    // Signaler une opération réussie au système operationMode
    operationMode.handleSuccessfulOperation();
    
    return netlifyResponse.json();
  }
}

/**
 * Utilise un proxy CORS côté client pour appeler l'API Notion
 */
async function useCorsProxy(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  // Pour le proxy CORS, on maintient le format complet avec /v1
  const corsEndpoint = endpoint.startsWith('/v1/') 
    ? endpoint 
    : `/v1${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
  // Construire l'URL complète vers l'API Notion
  const baseUrl = 'https://api.notion.com';
  const url = `${baseUrl}${corsEndpoint}`;
  
  console.log(`📡 Requête Notion via proxy CORS: ${method} ${url}`);
  
  // Obtenir le proxy CORS
  const currentProxy = corsProxy.getCurrentProxy();
  if (!currentProxy) {
    throw new Error('Aucun proxy CORS disponible. Activez le mode démo ou configurez un proxy.');
  }
  
  // Construire l'URL du proxy
  const proxiedUrl = corsProxy.proxify(url);
  console.log(`🔄 Utilisation du proxy CORS: ${currentProxy.url} pour appeler ${url}`);
  
  // Configurer les options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': token || '',
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  };
  
  // Ajouter le corps de la requête si nécessaire
  if (body && (method !== 'GET' && method !== 'HEAD')) {
    options.body = JSON.stringify(body);
  }
  
  // Effectuer la requête HTTP
  const response = await fetch(proxiedUrl, options);
  
  // Vérifier si la réponse est OK (statut 2xx)
  if (!response.ok) {
    // En cas d'erreur, essayer de récupérer les détails
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `Erreur HTTP ${response.status}`;
    
    // Transformer en erreur avec détails
    const error = new Error(`${errorMessage} (${response.status})`);
    throw error;
  }
  
  // Signaler une opération réussie au système operationMode
  operationMode.handleSuccessfulOperation();
  
  // Analyser et retourner la réponse JSON
  return await response.json();
}

/**
 * Fonction proxy pour les requêtes Notion, alias de notionApiRequest
 * Maintenue pour la compatibilité avec le code existant
 */
export const proxyFetch = notionApiRequest;
