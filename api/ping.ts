
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Configuration CORS minimale mais essentielle
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Gérer les requêtes OPTIONS (pré-flight CORS)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Réponse simple pour confirmer que l'API fonctionne
  return response.status(200).json({
    status: 'ok',
    message: 'API server is running',
    timestamp: new Date().toISOString()
  });
}
