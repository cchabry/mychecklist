
import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log détaillé pour le debug
  console.log(`[Notion Proxy] Request received: ${req.method} ${req.url}`);
  console.log(`[Notion Proxy] Headers:`, JSON.stringify(req.headers));
  
  // Configurer CORS - CRUCIAL pour le fonctionnement
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    console.log('[Notion Proxy] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  try {
    // Gérer GET pour les tests
    if (req.method === 'GET') {
      console.log('[Notion Proxy] Handling GET test request');
      return res.status(200).json({
        success: true,
        message: 'Notion API proxy is working',
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
    }
    
    // Gérer POST pour les vraies requêtes vers Notion
    if (req.method === 'POST') {
      console.log('[Notion Proxy] Handling POST request');
      
      if (!req.body) {
        console.error('[Notion Proxy] No body provided');
        return res.status(400).json({
          success: false,
          message: 'Request body is required'
        });
      }
      
      console.log('[Notion Proxy] Request body:', JSON.stringify(req.body));
      
      const { endpoint, method, token, body } = req.body;
      
      if (!endpoint) {
        console.error('[Notion Proxy] No endpoint specified');
        return res.status(400).json({
          success: false,
          message: 'Endpoint is required in the request body'
        });
      }
      
      if (!token) {
        console.error('[Notion Proxy] No token provided');
        return res.status(400).json({
          success: false,
          message: 'Notion API token is required'
        });
      }
      
      try {
        // Construire l'URL complète pour l'API Notion
        const notionApiUrl = `https://api.notion.com/v1${endpoint}`;
        console.log(`[Notion Proxy] Forwarding to Notion API: ${method || 'GET'} ${notionApiUrl}`);
        
        // Paramètres de la requête
        const fetchOptions = {
          method: method || 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        };
        
        // Requête à l'API Notion
        const notionResponse = await fetch(notionApiUrl, fetchOptions);
        const notionData = await notionResponse.json();
        
        console.log(`[Notion Proxy] Notion API response status: ${notionResponse.status}`);
        
        // Renvoyer la réponse de Notion
        return res.status(notionResponse.status).json(notionData);
        
      } catch (apiError) {
        console.error('[Notion Proxy] Error calling Notion API:', apiError);
        return res.status(500).json({
          success: false,
          message: 'Error forwarding request to Notion API',
          error: apiError.message
        });
      }
    }
    
    // Si on arrive ici, la méthode n'est pas supportée
    console.warn(`[Notion Proxy] Method not allowed: ${req.method}`);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
    
  } catch (error) {
    console.error('[Notion Proxy] Unhandled error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
