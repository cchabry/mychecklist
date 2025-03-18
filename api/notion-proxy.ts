
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Configuration CORS minimale
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gérer les requêtes OPTIONS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Pour les requêtes GET, retourner un statut OK simple
  if (request.method === 'GET') {
    return response.status(200).json({
      status: 'ok',
      message: 'Notion proxy is operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Pour les requêtes POST, vérifier la présence du corps
  if (request.method === 'POST') {
    try {
      // Si le corps est absent, retourner une erreur 400
      if (!request.body) {
        return response.status(400).json({
          error: 'Missing request body',
          message: 'Request body is required for POST requests'
        });
      }
      
      // Si c'est une requête ping spéciale, répondre simplement
      if (request.body.endpoint === '/ping') {
        return response.status(200).json({
          status: 'ok',
          message: 'Notion proxy ping successful',
          timestamp: new Date().toISOString()
        });
      }
      
      // Extraire les informations minimales de la requête
      const { endpoint, method, token } = request.body;
      
      // Vérifier les paramètres requis
      if (!endpoint || !token) {
        return response.status(400).json({
          error: 'Missing required parameters',
          message: 'Both endpoint and token are required'
        });
      }
      
      // Pour l'instant, retourner une réponse simulée sans appeler l'API Notion
      return response.status(200).json({
        status: 'ok',
        message: 'Proxy request processed successfully',
        request: {
          endpoint,
          method: method || 'GET',
          hasToken: !!token
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // En cas d'erreur, retourner un message simple
      return response.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Pour toute autre méthode HTTP, retourner une erreur 405
  return response.status(405).json({
    error: 'Method not allowed',
    message: `Method ${request.method} is not supported`
  });
}
