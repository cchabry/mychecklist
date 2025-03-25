
import { corsProxy } from '@/services/corsProxy';
import { operationModeUtils } from '@/services/operationMode/operationModeUtils';
import { ApiRequestContext } from './adapters';
import { logError } from './errorHandling';

// URL de base de l'API Notion
const NOTION_API_BASE_URL = 'https://api.notion.com/v1';

/**
 * Fonction principale pour faire des requêtes à l'API Notion via un proxy CORS
 * Version avec la nouvelle signature (3 arguments)
 */
export async function notionApiRequest(
  endpoint: string,
  options: RequestInit = {},
  context: ApiRequestContext = {}
): Promise<any> {
  try {
    // Récupérer le token depuis le contexte
    const token = context.token || localStorage.getItem('notion_api_key');
    
    // Vérifier si nous sommes en mode mock
    if (operationModeUtils.isMockActive()) {
      console.log(`🔶 Mock mode actif: simulation de requête ${options.method || 'GET'} ${endpoint}`);
      
      // Dans un scénario réel, nous aurions ici une logique de mock
      // qui retournerait des données simulées en fonction de l'endpoint
      
      // Attendre un peu pour simuler une latence réseau
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return { success: true, mock: true };
    }
    
    // Construire l'URL complète en s'assurant qu'elle n'a pas de double slash
    const apiEndpoint = endpoint.startsWith('/')
      ? `${NOTION_API_BASE_URL}${endpoint}`
      : `${NOTION_API_BASE_URL}/${endpoint}`;
    
    // Récupérer le proxy actuel
    const currentProxy = corsProxy.getCurrentProxy();
    
    if (!currentProxy) {
      throw new Error("Aucun proxy CORS n'est disponible. Veuillez configurer un proxy.");
    }
    
    // Construire l'URL avec le proxy
    const proxyUrl = `${currentProxy.url}${apiEndpoint}`;
    
    // Préparer les headers
    const headers = {
      'Accept': 'application/json',
      'Notion-Version': '2022-06-28',
      ...(options.headers || {})
    };
    
    // Ajouter l'authentification si un token est fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Options de la requête
    const requestOptions: RequestInit = {
      ...options,
      headers
    };
    
    // Exécuter la requête
    const response = await fetch(proxyUrl, requestOptions);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      // Essayer de lire le message d'erreur
      const errorText = await response.text();
      
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch (e) {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      throw new Error(`Notion API error: ${errorMessage}`);
    }
    
    // Traiter la réponse JSON
    const result = await response.json();
    return result;
  } catch (error) {
    // Journaliser l'erreur
    logError(error, `API Request (${endpoint})`);
    
    // Gérer l'erreur de fallback proxy
    if (error.message.includes('proxy') || error.message.includes('Failed to fetch')) {
      console.log('🔄 Tentative de trouver un proxy alternatif...');
      
      // Obtenir tous les proxies disponibles
      const availableProxies = corsProxy.getEnabledProxies();
      
      if (availableProxies.length > 1 && availableProxies.length > corsProxy.getEnabledProxies().indexOf(corsProxy.getCurrentProxy())) {
        // Choisir le prochain proxy dans la liste
        corsProxy.findWorkingProxy();
        
        // Retenter la requête après un court délai
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Nouvel essai avec un proxy différent');
        return notionApiRequest(endpoint, options, context);
      }
    }
    
    throw error;
  }
}
