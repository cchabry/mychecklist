
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Log incoming requests for debugging
  console.log(`[Notion Proxy] Request received: ${req.method} ${req.url}`);
  console.log(`[Notion Proxy] Headers:`, req.headers);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('[Notion Proxy] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Handle GET request for testing
  if (req.method === 'GET') {
    console.log('[Notion Proxy] Handling GET request');
    return res.status(200).json({
      success: true,
      message: 'Notion API proxy is working',
      method: 'GET',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle POST request for proxying to Notion API
  if (req.method === 'POST') {
    console.log('[Notion Proxy] Handling POST request with body:', req.body);
    
    // Simple response for now
    return res.status(200).json({
      success: true,
      message: 'POST request received successfully',
      method: 'POST',
      body: req.body || {},
      timestamp: new Date().toISOString()
    });
  }
  
  // Any other method is not allowed
  console.log(`[Notion Proxy] Method not allowed: ${req.method}`);
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  });
}
