
/**
 * Fonction utilitaire pour effectuer des requêtes à l'API Notion exclusivement via le service centralisé
 * @param endpoint Point d'accès de l'API Notion (relatif)
 * @param method Méthode HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param body Corps de la requête (optionnel)
 * @param token Jeton d'authentification Notion (optionnel, pris du localStorage par défaut)
 * @returns Promesse contenant la réponse JSON
 */

import { notionCentralService } from '@/services/notion/notionCentralService';

export const notionApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> => {
  // Log de débogage
  console.log(`🔧 Requête Notion (${method}): ${endpoint} via service centralisé`);

  // Normaliser l'endpoint pour garantir le format correct
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Appeler le service centralisé
  return await notionCentralService.request({
    endpoint: normalizedEndpoint,
    method: method as any,
    body,
    token
  });
};

/**
 * Normalise les endpoints pour garantir la cohérence
 */
function normalizeEndpoint(endpoint: string): string {
  // Enlever les barres obliques de début et de fin pour la normalisation
  let cleanedEndpoint = endpoint.trim();
  
  // Gérer le cas spécial où l'endpoint est déjà complet avec /v1
  if (cleanedEndpoint.startsWith('/v1/')) {
    return cleanedEndpoint.substring(3); // Enlever le /v1 pour serverless
  }
  
  // S'assurer que l'endpoint commence par une barre oblique
  if (!cleanedEndpoint.startsWith('/')) {
    cleanedEndpoint = '/' + cleanedEndpoint;
  }
  
  return cleanedEndpoint;
}

/**
 * Fonction alias pour la rétrocompatibilité
 */
export const proxyFetch = notionApiRequest;
