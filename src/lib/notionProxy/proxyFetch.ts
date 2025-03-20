
// Custom error class with status property
export class NotionError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'NotionError';
    this.status = status;
  }
}

// Use this function instead of creating a plain Error with status property
export function createNotionError(message: string, status?: number): NotionError {
  return new NotionError(message, status);
}

// Import required configuration
import { NOTION, STORAGE_KEYS } from './config';
import { mockMode } from './mockMode';
import { mockModeV2 } from './mockModeV2';
import { mockConfig } from './index';

/**
 * Fonction principale pour effectuer des requêtes vers l'API Notion
 * Gère la logique de proxy, mock, et cache
 */
export const notionApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> => {
  console.log(`📡 notionApiRequest: ${method} ${endpoint}`);
  
  // Vérifier si on doit utiliser le mock mode v2
  const useV2Mock = mockConfig.useV2 && !mockConfig.forceV1 && mockConfig.useV2();
  
  // Choisir le bon mode mock en fonction de la configuration
  const activeMockMode = useV2Mock ? mockModeV2 : mockMode;
  
  // Si nous sommes en mode mock, utiliser les données fictives
  if (activeMockMode.isActive()) {
    console.log(`🧪 Using ${useV2Mock ? 'v2' : 'v1'} mock data for ${endpoint}`);
    return activeMockMode.getMockResponse(endpoint, method, body);
  }
  
  try {
    // Construction de l'URL complète
    const baseUrl = NOTION.API_BASE_URL;
    const fullUrl = `${baseUrl}${endpoint}`;
    
    console.log(`🔗 Requesting Notion API: ${fullUrl}`);
    
    // Préparer les en-têtes pour l'API Notion
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Notion-Version': NOTION.API_VERSION,
    };
    
    // Ajouter le token d'authentification s'il est fourni
    if (token) {
      // Si le token ne commence pas par "Bearer ", l'ajouter
      if (!token.startsWith('Bearer ')) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = token;
      }
    }
    
    // Options pour la requête fetch
    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
    
    // Effectuer la requête à l'API Notion
    const response = await fetch(fullUrl, options);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`❌ Notion API error (${response.status}):`, errorData);
      
      // Créer une erreur avec le statut
      const error = createNotionError(
        errorData?.message || `Notion API returned ${response.status}`,
        response.status
      );
      
      throw error;
    }
    
    // Traiter la réponse JSON
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('❌ Error in notionApiRequest:', error);
    
    // Propagate the error
    throw error;
  }
};
