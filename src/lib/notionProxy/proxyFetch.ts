
/**
 * Fonction utilitaire pour effectuer des requêtes à l'API Notion exclusivement via les fonctions Netlify
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
  // Log de débogage
  console.log(`🔧 Requête Notion (${method}): ${endpoint}`);

  // Normaliser l'endpoint pour garantir le format correct
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Récupérer le token d'authentification si non fourni
  const authToken = token || localStorage.getItem('notion_api_key');
  
  if (!authToken) {
    throw new Error('Token Notion manquant');
  }
  
  // Formater correctement le token pour l'API Notion
  let formattedToken = authToken;
  if (!formattedToken.startsWith('Bearer ')) {
    if (formattedToken.startsWith('secret_') || formattedToken.startsWith('ntn_')) {
      formattedToken = `${formattedToken}`; // La fonction serverless ajoutera 'Bearer '
    }
  }
  
  try {
    // Utiliser exclusivement la fonction Netlify
    console.log(`📡 Requête via fonction Netlify: ${method} ${normalizedEndpoint}`);
    
    const response = await fetch('/.netlify/functions/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: normalizedEndpoint,
        method,
        body,
        token: formattedToken
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur du proxy Netlify: ${response.status} - ${errorText}`);
      throw new Error(`Erreur du proxy Netlify: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Réponse reçue via fonction Netlify: ${method} ${normalizedEndpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel à la fonction Netlify: ${error.message}`);
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
