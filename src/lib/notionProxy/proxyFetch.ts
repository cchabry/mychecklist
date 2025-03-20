import { getStoredNotionError, storeNotionError } from './errorHandling';
import { notionApi } from './index';
import { mockNotionResponse } from './mockData';
import { mockNotionResponseV2 } from './mockDataV2';
import { mockConfig } from './index';

/**
 * Fonction principale pour les requêtes à l'API Notion
 * Gère automatiquement les contextes de proxy, de mode mock, etc.
 * @param endpoint Endpoint de l'API Notion (ex: /users/me, /databases/{id})
 * @param method Méthode HTTP (GET, POST, PATCH, DELETE)
 * @param body Corps de la requête (pour POST, PATCH)
 * @param token Token d'authentification Notion
 * @returns Promesse avec la réponse de l'API
 */
export const notionApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> => {
  // Vérifier si une erreur Notion est stockée
  const storedError = getStoredNotionError();
  if (storedError) {
    console.warn('Erreur Notion stockée détectée, bloquant la requête.');
    throw new Error(storedError.message);
  }
  
  // Configuration de l'URL de base
  const baseUrl = 'https://api.notion.com/v1';
  const url = `${baseUrl}${endpoint}`;
  
  // Configuration des options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  
  // Si le mode mock est activé, utiliser les données simulées
  const mockModeActive = notionApi.mockMode.isActive();
  
  if (mockModeActive) {
    try {
      // Déterminer quelle version du mockMode utiliser
      const useMockV2 = !mockConfig.forceV1 && mockConfig.useV2();
      
      if (useMockV2) {
        console.log(`[MOCK V2] Requête simulée: ${method} ${endpoint}`);
        return await mockNotionResponseV2(endpoint, method, body);
      } else {
        console.log(`[MOCK V1] Requête simulée: ${method} ${endpoint}`);
        return await mockNotionResponse(endpoint, method, body);
      }
    } catch (mockError) {
      console.error('Erreur lors de la simulation de réponse:', mockError);
      throw new Error(`Erreur dans le mode mock: ${mockError.message || 'Erreur inconnue'}`);
    }
  }
  
  try {
    // Exécuter la requête
    console.log(`[${method}] Notion API Request: ${url}`);
    const response = await fetch(url, options);
    
    // Gérer les erreurs de réponse
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur de réponse de Notion:', errorData);
      
      // Stocker l'erreur pour les prochaines requêtes
      storeNotionError({
        status: response.status,
        code: errorData.code,
        message: errorData.message
      });
      
      throw new Error(`Notion API Error: ${errorData.message} (Status: ${response.status})`);
    }
    
    // Parser la réponse JSON
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Erreur lors de la requête à Notion:', error);
    throw error;
  }
};
