
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log request info for debugging
  console.log(`Proxy request received: ${req.method} ${req.url}`);
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Notion API proxy is working',
      method: 'GET',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    console.log('POST body:', req.body);
    
    return res.status(200).json({
      success: true,
      message: 'POST request received',
      method: 'POST',
      body: req.body || {},
      timestamp: new Date().toISOString()
    });
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
