
import { notionApiRequest } from './proxyFetch';

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
    headers: {}
  };
  
  // Ajouter le corps si présent et pas en GET
  if (method !== 'GET' && body) {
    options.body = JSON.stringify(body);
  }
  
  // Contexte pour l'API request avec le token
  const context = { token };
  
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
