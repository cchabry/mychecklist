
import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log('Notion proxy received request:', request.method, request.url);
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    
    // Enable CORS for development
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version');
    
    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return response.status(200).end();
    }
    
    // Handle GET request for testing the proxy
    if (request.method === 'GET') {
      console.log('Handling GET request to notion-proxy');
      return response.status(200).json({
        status: 'ok',
        message: 'Notion proxy is working',
        timestamp: new Date().toISOString(),
        usage: 'Send a POST request with endpoint, method, and token parameters'
      });
    }

    // Handle POST request for making calls to Notion
    if (request.method === 'POST') {
      console.log('Handling POST request to notion-proxy');
      console.log('Request body:', typeof request.body, request.body ? 'has content' : 'is empty');
      
      // Check that the body is present
      if (!request.body) {
        console.error('Request body is missing');
        return response.status(400).json({
          error: 'Missing request body'
        });
      }
      
      // Parse body if it's a string
      let parsedBody;
      try {
        parsedBody = typeof request.body === 'string' 
          ? JSON.parse(request.body) 
          : request.body;
        
        console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return response.status(400).json({
          error: 'Invalid JSON in request body'
        });
      }
      
      const { endpoint, method, body, token } = parsedBody;
      console.log('Request parameters:', { 
        endpoint, 
        method, 
        bodyPresent: !!body, 
        tokenPresent: !!token 
      });

      // Validate parameters
      if (!endpoint) {
        console.error('Missing endpoint parameter');
        return response.status(400).json({
          error: 'Missing required parameter: endpoint'
        });
      }

      if (!token) {
        console.error('Missing token parameter');
        return response.status(400).json({
          error: 'Missing required parameter: token'
        });
      }

      // Build full Notion API URL
      const targetUrl = `${NOTION_API_BASE}${endpoint}`;
      console.log(`Target URL: ${targetUrl}`);

      // Prepare headers for Notion API
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      };
      
      console.log(`Making ${method || 'GET'} request to Notion API`);
      
      // Make request to Notion API
      try {
        const notionResponse = await fetch(targetUrl, {
          method: method || 'GET',
          headers,
          body: body ? JSON.stringify(body) : undefined
        });
        
        console.log('Notion API response status:', notionResponse.status);
        
        // Get response body
        let responseData;
        try {
          responseData = await notionResponse.json();
          console.log('Response data type:', typeof responseData);
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          const textResponse = await notionResponse.text();
          console.log('Text response:', textResponse);
          return response.status(notionResponse.status).send(textResponse);
        }

        // Return Notion API response
        return response.status(notionResponse.status).json(responseData);
      } catch (fetchError) {
        console.error('Fetch error when calling Notion API:', fetchError);
        return response.status(500).json({
          error: 'Failed to fetch from Notion API',
          message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        });
      }
    }

    // Method not supported
    console.error(`Unsupported method: ${request.method}`);
    return response.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only supports GET and POST methods'
    });
  } catch (error) {
    console.error('Notion proxy error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
