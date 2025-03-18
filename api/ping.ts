
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Configuration CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Désactiver la mise en cache
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  // Gérer les requêtes OPTIONS (pre-flight CORS)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Répondre avec un simple message de statut
  return response.status(200).json({
    status: 'ok',
    message: 'Le proxy Notion est accessible',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
}
