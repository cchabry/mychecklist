
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request (test endpoint)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Notion proxy is working', 
      timestamp: new Date().toISOString() 
    });
  }
  
  // Handle POST request (actual proxy)
  if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'Notion proxy POST endpoint is working',
      received: req.body ? true : false,
      timestamp: new Date().toISOString()
    });
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
