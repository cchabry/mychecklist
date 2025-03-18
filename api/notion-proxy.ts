
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set very comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight OPTIONS requests properly
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // For POST requests, parse and respond with the body
  if (req.method === 'POST') {
    try {
      // Echo back the request body if it exists
      const body = req.body ? req.body : {};
      
      return res.status(200).json({
        status: 'ok',
        message: 'POST received',
        method: req.method,
        body: body,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Simple error handling
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Default response for GET and other methods
  return res.status(200).json({
    status: 'ok',
    message: 'Notion proxy responding',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
