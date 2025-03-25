
import { notionApiRequest } from './proxyFetch';

/**
 * Type pour le contexte de requête API
 */
export interface ApiRequestContext {
  token?: string;
  [key: string]: any;
}

/**
 * Adaptateur de compatibilité pour les anciens appels d'API à 4 arguments
 * vers la nouvelle signature à 3 arguments
 */
export function legacyApiAdapter(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  // Construire les options RequestInit à partir de method et body
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Ajouter le corps si présent et pas en GET
  if (method !== 'GET' && body) {
    options.body = JSON.stringify(body);
  }
  
  // Contexte pour l'API request avec le token
  const context: ApiRequestContext = { token };
  
  // Appeler l'API avec la nouvelle signature
  return notionApiRequest(endpoint, options, context);
}

// Fonction pour convertir les appels d'API de style string à RequestInit
export function convertMethodToOptions(
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<any> {
  return legacyApiAdapter(endpoint, method, body, token);
}
