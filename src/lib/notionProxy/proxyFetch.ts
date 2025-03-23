
/**
 * Proxy pour les requêtes à l'API Notion
 * Gère à la fois les requêtes directes et via le proxy serverless
 */

/**
 * Fonction pour effectuer des requêtes à l'API Notion
 * @param endpoint Point de terminaison de l'API Notion
 * @param method Méthode HTTP
 * @param body Corps de la requête (optionnel)
 * @param token Token d'authentification Notion (optionnel)
 * @returns Réponse de l'API
 */
export async function notionApiRequest<T = any>(
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<T> {
  const baseUrl = 'https://api.notion.com/v1';
  const url = `${baseUrl}${endpoint}`;
  
  // Construire les en-têtes de la requête
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  
  // Ajouter le token d'authentification s'il est fourni
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  
  try {
    // Effectuer la requête
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API error (${response.status}): ${errorText}`);
    }
    
    // Convertir la réponse en JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching Notion API (${endpoint}):`, error);
    throw error;
  }
}

// Exporter une version alias pour compatibilité
export const proxyFetch = notionApiRequest;
