
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
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
      }
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
      return response.status(notionResponse.status).json(responseData);
    }
    
    // Retourner les données de l'API Notion
    return response.status(200).json(responseData);
  } catch (error) {
    console.error('[Notion Proxy] Erreur non gérée:', error);
    return response.status(500).json({ 
      error: 'Erreur serveur lors de la communication avec l\'API Notion',
      details: error.message 
    });
  }
}
