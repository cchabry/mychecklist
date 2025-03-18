
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[DEBUG] Request received:', req.method, req.url);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Debug info for GET
  if (req.method === 'GET') {
    try {
      const debugInfo = {
        status: 'ok',
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(debugInfo);
    } catch (error) {
      console.error('[DEBUG] Error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
