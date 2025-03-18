
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      // Return the request body as a basic echo
      return res.status(200).json({
        success: true,
        method: 'POST',
        body: req.body || {},
        time: new Date().toISOString()
      });
    } catch (error) {
      // Simple error handling with explicit response
      console.error('Error processing POST request:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  // Handle GET requests
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      method: 'GET',
      message: 'Notion proxy is running',
      version: '1.0.0'
    });
  }

  // Default for any other method
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    message: `The method ${req.method} is not supported`
  });
}
