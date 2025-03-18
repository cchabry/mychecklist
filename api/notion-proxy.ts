
import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log('Notion proxy received request:', request.method, request.url);
    console.log('Request headers:', request.headers);
    
    // Enable CORS for development
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version');
    
    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return response.status(200).end();
    }
    
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
      console.log('Request body type:', typeof request.body);
      
      // Vérifier que le body est bien présent
      if (!request.body) {
        console.log('Request body is missing');
        return response.status(400).json({
          error: 'Missing request body'
        });
      }
      
      // Ensure body is parsed as JSON if it's a string
      let parsedBody;
      try {
        parsedBody = typeof request.body === 'string' 
          ? JSON.parse(request.body) 
          : request.body;
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return response.status(400).json({
          error: 'Invalid JSON in request body'
        });
      }
      
      const { endpoint, method, body, token } = parsedBody;
      console.log('Request body parsed:', { 
        endpoint, 
        method, 
        hasBody: !!body, 
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      });

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
      
      // Logging request details
      console.log(`Making ${method || 'GET'} request to Notion API at: ${targetUrl}`);
      console.log('With headers:', Object.keys(headers).join(', '));

      // Effectuer la requête vers l'API Notion
      try {
        console.log(`Proxying request to: ${targetUrl}`);
        const notionResponse = await fetch(targetUrl, {
          method: method || 'GET',
          headers,
          body: body ? JSON.stringify(body) : undefined
        });
        
        console.log(`Response from Notion API: status ${notionResponse.status}`);
        
        // Récupérer le corps de la réponse
        let responseData;
        try {
          responseData = await notionResponse.json();
          console.log('Response data received:', typeof responseData);
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          const textResponse = await notionResponse.text();
          console.log('Text response:', textResponse);
          return response.status(notionResponse.status).send(textResponse);
        }

        // Renvoyer la réponse de l'API Notion
        return response.status(notionResponse.status).json(responseData);
      } catch (fetchError) {
        console.error('Fetch error when calling Notion API:', fetchError);
        return response.status(500).json({
          error: 'Failed to fetch from Notion API',
          message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        });
      }
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
