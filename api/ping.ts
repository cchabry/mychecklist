
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API de ping - fournit un endpoint basique pour tester le déploiement
 */
export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log('📡 [Ping] Ping endpoint hit');
  
  // Enable CORS for all origins
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Handle OPTIONS request (pre-flight)
  if (request.method === 'OPTIONS') {
    console.log('📡 [Ping] Responding to OPTIONS request');
    return response.status(200).end();
  }
  
  // Get deployment information
  const deploymentUrl = process.env.VERCEL_URL || 'local-development';
  const environment = process.env.VERCEL_ENV || 'development';
  
  // Return a detailed response with deployment info
  return response.status(200).json({
    status: 'ok',
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    deployment: {
      url: deploymentUrl,
      environment: environment,
      region: process.env.VERCEL_REGION || 'unknown'
    },
    proxyStatus: {
      expectedPath: '/api/notion-proxy',
      checkTime: new Date().toISOString()
    },
    headers: request.headers
  });
}
