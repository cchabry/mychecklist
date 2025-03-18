
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Simple CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Notion API proxy is working',
      method: 'GET'
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'POST request received',
      method: 'POST',
      body: req.body || {}
    });
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
