
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';

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
  // Log de débogage
  console.log(`🔧 Requête Notion (${method}): ${endpoint}`);

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
    
    // En mode démo, retourner un résultat fictif générique
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
    // Utiliser directement la fonction Netlify
    return await useServerlessProxy(normalizedEndpoint, method, body, formattedToken);
  } catch (error) {
    // En cas d'erreur, signaler au système operationMode
    operationMode.handleConnectionError(
      error instanceof Error ? error : new Error(String(error)),
      `notionApiRequest: ${normalizedEndpoint}`
    );
    
    // Si la fonction Netlify échoue, passer automatiquement en mode démo
    console.error('Erreur lors de l\'appel à la fonction Netlify. Activation du mode démo.', error);
    operationMode.enableDemoMode('Erreur de connexion à l\'API Notion');
    
    // Retourner un résultat vide pour éviter de bloquer l'application
    return { success: false, error: error.message || 'Erreur inconnue' };
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
 * Utilise les fonctions serverless (Netlify) pour appeler l'API Notion
 */
async function useServerlessProxy(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<any> {
  console.log(`📡 Requête via fonction Netlify: ${method} ${endpoint}`);
  
  try {
    // Utiliser directement le chemin Netlify
    const netlifyResponse = await fetch('/.netlify/functions/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        method,
        body,
        token
      })
    });
    
    if (!netlifyResponse.ok) {
      const errorText = await netlifyResponse.text();
      console.error('Réponse d\'erreur de la fonction Netlify:', errorText);
      throw new Error(`Erreur du proxy Netlify: ${netlifyResponse.status} ${errorText}`);
    }
    
    // Signaler une opération réussie au système operationMode
    operationMode.handleSuccessfulOperation();
    
    return netlifyResponse.json();
  } catch (error) {
    console.error('Erreur lors de l\'appel à la fonction Netlify:', error);
    throw error;
  }
}

/**
 * Fonction proxy pour les requêtes Notion, alias de notionApiRequest
 * Maintenue pour la compatibilité avec le code existant
 */
export const proxyFetch = notionApiRequest;
