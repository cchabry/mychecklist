
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
  // Vérifier si nous sommes en mode démo simulé
  if (operationMode.isDemoMode) {
    // Simuler un délai réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire selon le taux configuré
    if (operationModeUtils.shouldSimulateError()) {
      throw new Error(`Erreur simulée lors de l'appel à ${endpoint}`);
    }
    
    // En mode démo, on devrait normalement utiliser les données mock au lieu d'appeler cette fonction
    console.warn(`notionApiRequest appelé en mode démo pour ${endpoint}. Utiliser les données mock directement.`);
    
    // Retourner un résultat fictif générique
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
    if (formattedToken.startsWith('secret_')) {
      formattedToken = `Bearer ${formattedToken}`;
    }
  }
  
  // Construire l'URL complète vers l'API Notion
  const baseUrl = 'https://api.notion.com/v1';
  const url = `${baseUrl}${endpoint}`;
  
  // Configurer les options de la requête
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': formattedToken,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  };
  
  // Ajouter le corps de la requête si nécessaire
  if (body && (method !== 'GET' && method !== 'HEAD')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    // Effectuer la requête HTTP
    const response = await fetch(url, options);
    
    // Vérifier si la réponse est OK (statut 2xx)
    if (!response.ok) {
      // En cas d'erreur, essayer de récupérer les détails
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Erreur HTTP ${response.status}`;
      
      // Transformer en erreur avec détails
      const error = new Error(`${errorMessage} (${response.status})`);
      throw error;
    }
    
    // Signaler une opération réussie au système operationMode
    operationMode.handleSuccessfulOperation();
    
    // Analyser et retourner la réponse JSON
    return await response.json();
  } catch (error) {
    // En cas d'erreur, signaler au système operationMode
    operationMode.handleConnectionError(
      error instanceof Error ? error : new Error(String(error)),
      `notionApiRequest: ${endpoint}`
    );
    
    // Propager l'erreur
    throw error;
  }
};
