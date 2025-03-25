
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';
import { corsProxy } from '@/services/corsProxy';
import { 
  getDeploymentType, 
  isNetlifyDeployment, 
  isLovablePreview,
  isDeploymentDebuggingEnabled,
  PROXY_CONFIG,
  getServerlessProxyUrl,
  STORAGE_KEYS
} from './config';

/**
 * Fonction utilitaire pour effectuer des requêtes à l'API Notion via un proxy
 * Stratégie optimisée pour minimiser les erreurs CORS
 */
export const notionApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  // Log de débogage pour le type de déploiement
  const deploymentType = getDeploymentType();
  if (isDeploymentDebuggingEnabled()) {
    console.log(`🌍 Type de déploiement détecté: ${deploymentType}`);
    console.log(`🔧 Requête Notion (${method}): ${endpoint}`);
  }

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
  const authToken = token || localStorage.getItem(STORAGE_KEYS.API_KEY);
  
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
  
  // Mettre en place un timeout pour toutes les requêtes
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout de la requête Notion')), PROXY_CONFIG.REQUEST_TIMEOUT);
  });

  try {
    // Stratégie 1: Utiliser d'abord la fonction serverless Netlify
    if (isNetlifyDeployment()) {
      try {
        const result = await Promise.race([
          useNetlifyProxy(normalizedEndpoint, method, body, formattedToken),
          timeoutPromise
        ]);
        
        // Si ça fonctionne, signaler une opération réussie
        operationMode.handleSuccessfulOperation();
        return result;
      } catch (netlifyError) {
        console.warn('⚠️ Échec de la fonction Netlify:', netlifyError.message);
        // Passer à la stratégie suivante en cas d'échec
      }
    }
    
    // Stratégie 2: Essayer le proxy CORS depuis le client
    try {
      const result = await Promise.race([
        useCorsProxy(normalizedEndpoint, method, body, formattedToken),
        timeoutPromise
      ]);
      
      // Si ça fonctionne, signaler une opération réussie
      operationMode.handleSuccessfulOperation();
      return result;
    } catch (corsError) {
      console.warn('⚠️ Échec du proxy CORS:', corsError.message);
      
      // Tenter d'autres proxies CORS en cas d'échec
      const newProxyFound = await corsProxy.findWorkingProxy(formattedToken);
      
      if (newProxyFound) {
        try {
          const result = await Promise.race([
            useCorsProxy(normalizedEndpoint, method, body, formattedToken),
            timeoutPromise
          ]);
          
          operationMode.handleSuccessfulOperation();
          return result;
        } catch (retryError) {
          console.error('❌ Échec après tentative avec nouveau proxy:', retryError.message);
        }
      }
      
      // Si tout échoue, basculer en mode démo automatiquement
      operationMode.enableDemoMode('Échec de connexion à Notion');
      
      // Retourner un résultat factice comme fallback ultime
      return { 
        success: false, 
        error: "Connexion à Notion échouée, mode démonstration activé",
        fallback: true
      };
    }
  } catch (error) {
    // En cas d'erreur, signaler au système operationMode
    operationMode.handleConnectionError(
      error instanceof Error ? error : new Error(String(error)),
      `notionApiRequest: ${normalizedEndpoint}`
    );
    
    // Propager l'erreur
    throw error;
  }
};

/**
 * Normalise les endpoints pour garantir la cohérence
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
  
  // Ajouter le préfixe /v1 si nécessaire
  return `/v1${cleanedEndpoint}`;
}

/**
 * Utilise les fonctions Netlify pour appeler l'API Notion
 */
async function useNetlifyProxy(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  // Pour les fonctions serverless, on doit retirer le préfixe /v1
  const serverlessEndpoint = endpoint.startsWith('/v1/')
    ? endpoint.substring(3) // Enlever le /v1 car il sera ajouté par le proxy
    : endpoint;

  // URL de la fonction Netlify
  const netlifyProxyUrl = '/.netlify/functions/notion-proxy';
  
  // Faire une requête POST à la fonction serverless
  const response = await fetch(netlifyProxyUrl, {
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
  
  if (!response.ok) {
    let errorMessage = `Erreur du proxy Netlify: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage += ` ${JSON.stringify(errorData)}`;
    } catch (e) {
      // Si on ne peut pas parser le JSON, utiliser le texte brut
      const errorText = await response.text();
      errorMessage += ` ${errorText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
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
  const baseUrl = PROXY_CONFIG.NOTION_API_BASE;
  const url = `${baseUrl}${corsEndpoint}`;
  
  // Obtenir le proxy CORS
  const currentProxy = corsProxy.getCurrentProxy();
  if (!currentProxy) {
    throw new Error('Aucun proxy CORS disponible. Activez le mode démo ou configurez un proxy.');
  }
  
  // Construire l'URL du proxy
  const proxiedUrl = corsProxy.proxify(url);
  
  // Configurer les options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': token || '',
      'Content-Type': 'application/json',
      'Notion-Version': PROXY_CONFIG.NOTION_API_VERSION
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
    throw new Error(`Erreur HTTP ${response.status} (${errorMessage})`);
  }
  
  // Analyser et retourner la réponse JSON
  return await response.json();
}

/**
 * Fonction proxy pour les requêtes Notion, alias de notionApiRequest
 * Maintenue pour la compatibilité avec le code existant
 */
export const proxyFetch = notionApiRequest;
