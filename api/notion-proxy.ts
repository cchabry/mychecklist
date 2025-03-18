
import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Gérer les requêtes GET pour tester le proxy
    if (request.method === 'GET') {
      return response.status(200).json({
        status: 'ok',
        message: 'Notion proxy is working',
        timestamp: new Date().toISOString(),
        usage: 'Send a POST request with endpoint, method, and token parameters'
      });
    }

    // Gérer les requêtes POST pour effectuer des appels à Notion
    if (request.method === 'POST') {
      const { endpoint, method, body, token } = request.body;

      // Valider les paramètres
      if (!endpoint) {
        return response.status(400).json({
          error: 'Missing required parameter: endpoint'
        });
      }

      if (!token) {
        return response.status(400).json({
          error: 'Missing required parameter: token'
        });
      }

      // Construire l'URL complète de l'API Notion
      const targetUrl = `${NOTION_API_BASE}${endpoint}`;

      // Préparer les headers pour l'API Notion
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      };

      // Effectuer la requête vers l'API Notion
      console.log(`Proxying request to: ${targetUrl}`);
      const notionResponse = await fetch(targetUrl, {
        method: method || 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      // Récupérer le corps de la réponse
      const responseData = await notionResponse.json();

      // Renvoyer la réponse de l'API Notion
      return response.status(notionResponse.status).json(responseData);
    }

    // Méthode non supportée
    return response.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only supports GET and POST methods'
    });
  } catch (error) {
    console.error('Notion proxy error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
