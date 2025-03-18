
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[DEBUG] Request received:', req.method, req.url);
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // Gérer les requêtes GET
  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Plus d'informations de débogage
    return res.status(200).json({
      status: 'ok',
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      timestamp: new Date().toISOString()
    });
  }
  
  // Rejeter les autres méthodes
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(405).json({ error: 'Method not allowed' });
}
