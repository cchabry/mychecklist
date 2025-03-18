
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Configuration CORS minimale
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Gérer les requêtes OPTIONS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Information sur l'environnement Vercel
  const environment = {
    node_version: process.version,
    vercel_env: process.env.VERCEL_ENV || 'development',
    vercel_region: process.env.VERCEL_REGION || 'unknown',
    vercel_url: process.env.VERCEL_URL || 'unknown'
  };
  
  // Retourner les informations de diagnostic
  return response.status(200).json({
    status: 'ok',
    message: 'Vercel diagnostic information',
    timestamp: new Date().toISOString(),
    environment,
    request: {
      method: request.method,
      url: request.url
    }
  });
}
