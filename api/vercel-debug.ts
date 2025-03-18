
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API de diagnostic Vercel - permet de vérifier la configuration des fonctions serverless
 */
export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log('📊 [Vercel Debug] Debug endpoint hit');
  
  // Activer CORS pour toutes les origines
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Traiter les requêtes OPTIONS (pre-flight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Obtenir des informations sur les fichiers et la configuration
  const files = {
    'api/notion-proxy.ts': true,
    'api/ping.ts': true,
    'api/vercel-debug.ts': true,
    'vercel.json': true
  };
  
  // Liste des endpoints attendus
  const endpoints = [
    { path: '/api/notion-proxy', methods: ['GET', 'POST', 'HEAD', 'OPTIONS'] },
    { path: '/api/ping', methods: ['GET', 'OPTIONS'] },
    { path: '/api/vercel-debug', methods: ['GET', 'OPTIONS'] }
  ];
  
  // Obtenir des informations sur l'environnement
  const environment = {
    node: process.version,
    env: process.env.VERCEL_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    url: process.env.VERCEL_URL || 'unknown',
    deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'unknown'
  };
  
  // Renvoyer les informations de diagnostic
  return response.status(200).json({
    status: 'ok',
    message: 'Vercel diagnostic tool',
    timestamp: new Date().toISOString(),
    files,
    endpoints,
    environment,
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  });
}
