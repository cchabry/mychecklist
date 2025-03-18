
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Configuration CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gérer les requêtes OPTIONS (pre-flight CORS)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  try {
    // Extraire les informations de la requête
    const { endpoint, method = 'GET', body, token } = request.body;
    
    // Vérifier les paramètres requis
    if (!endpoint || !token) {
      return response.status(400).json({ 
        error: 'Paramètres manquants: endpoint et token sont requis' 
      });
    }
    
    // Construire l'URL complète pour l'API Notion
    const url = `https://api.notion.com/v1${endpoint}`;
    
    console.log(`[Notion Proxy] Requête ${method} vers ${url}`);
    
    // Définir les options de la requête
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      // Ajouter un timeout de 25 secondes
      signal: AbortSignal.timeout(25000)
    };
    
    // Ajouter le corps de la requête si nécessaire
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Effectuer la requête à l'API Notion
    const notionResponse = await fetch(url, fetchOptions);
    
    // Récupérer le corps de la réponse
    const responseData = await notionResponse.json();
    
    // Si la réponse n'est pas OK, retourner l'erreur
    if (!notionResponse.ok) {
      console.error(`[Notion Proxy] Erreur ${notionResponse.status}: ${JSON.stringify(responseData)}`);
      return response.status(notionResponse.status).json({
        error: responseData.message || 'Erreur API Notion',
        details: responseData,
        status: notionResponse.status
      });
    }
    
    // Retourner les données de l'API Notion
    return response.status(200).json(responseData);
  } catch (error) {
    console.error('[Notion Proxy] Erreur non gérée:', error);
    
    // Formater l'erreur de manière cohérente
    const errorMessage = error.message || 'Erreur serveur inconnue';
    const errorDetails = error.stack || '';
    
    return response.status(500).json({ 
      error: 'Erreur serveur lors de la communication avec l\'API Notion',
      message: errorMessage,
      details: errorDetails
    });
  }
}
