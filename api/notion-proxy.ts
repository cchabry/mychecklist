
import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log('Notion proxy received request:', request.method, request.url);
    
    // Gérer les requêtes GET pour tester le proxy
    if (request.method === 'GET') {
      console.log('Handling GET request to notion-proxy');
      return response.status(200).json({
        status: 'ok',
        message: 'Notion proxy is working',
        timestamp: new Date().toISOString(),
        usage: 'Send a POST request with endpoint, method, and token parameters'
      });
    }

    // Gérer les requêtes POST pour effectuer des appels à Notion
    if (request.method === 'POST') {
      console.log('Handling POST request to notion-proxy');
      
      // Vérifier que le body est bien présent
      if (!request.body) {
        console.log('Request body is missing');
        return response.status(400).json({
          error: 'Missing request body'
        });
      }
      
      const { endpoint, method, body, token } = request.body;
      console.log('Request body:', { endpoint, method, hasBody: !!body, hasToken: !!token });

      // Valider les paramètres
      if (!endpoint) {
        console.log('Missing endpoint parameter');
        return response.status(400).json({
          error: 'Missing required parameter: endpoint'
        });
      }

      if (!token) {
        console.log('Missing token parameter');
        return response.status(400).json({
          error: 'Missing required parameter: token'
        });
      }

      // Construire l'URL complète de l'API Notion
      const targetUrl = `${NOTION_API_BASE}${endpoint}`;
      console.log(`Constructed target URL: ${targetUrl}`);

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
      
      console.log(`Response from Notion API: status ${notionResponse.status}`);

      // Récupérer le corps de la réponse
      const responseData = await notionResponse.json();

      // Renvoyer la réponse de l'API Notion
      return response.status(notionResponse.status).json(responseData);
    }

    // Méthode non supportée
    console.log(`Unsupported method: ${request.method}`);
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
