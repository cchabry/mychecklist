
import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[Notion Proxy] Request received: ${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[Notion Proxy] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Handle GET for testing
  if (req.method === 'GET') {
    console.log('[Notion Proxy] Handling GET test request');
    try {
      return res.status(200).json({
        success: true,
        message: 'Notion API proxy is working',
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
    } catch (error) {
      console.error('[Notion Proxy] GET error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Handle POST for Notion API requests
  if (req.method === 'POST') {
    console.log('[Notion Proxy] Handling POST request');
    
    try {
      // Check for required fields
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required'
        });
      }
      
      const { endpoint, method, token, body } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({
          success: false,
          message: 'Endpoint is required in the request body'
        });
      }
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Notion API token is required'
        });
      }
      
      // Construct Notion API URL
      const notionApiUrl = `https://api.notion.com/v1${endpoint}`;
      console.log(`[Notion Proxy] Forwarding to Notion API: ${method || 'GET'} ${notionApiUrl}`);
      
      // Setup fetch options
      const fetchOptions = {
        method: method || 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      };
      
      // Make request to Notion API
      const notionResponse = await fetch(notionApiUrl, fetchOptions);
      const notionData = await notionResponse.json();
      
      console.log(`[Notion Proxy] Notion API response status: ${notionResponse.status}`);
      
      // Return Notion API response
      return res.status(notionResponse.status).json(notionData);
      
    } catch (error) {
      console.error('[Notion Proxy] POST error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error forwarding request to Notion API',
        error: error.message
      });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  });
}
