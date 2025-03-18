
// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

exports.handler = async (event, context) => {
  try {
    // Log request details for debugging
    console.log('Netlify function: Notion proxy received request:', event.httpMethod, event.path);
    console.log('Request headers:', JSON.stringify(event.headers, null, 2));
    
    // Set CORS headers for all responses
    const headers = {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
    };
    
    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }
    
    // Handle GET request for testing the proxy
    if (event.httpMethod === 'GET') {
      console.log('Handling GET request to notion-proxy');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
          message: 'Notion proxy is working on Netlify',
          timestamp: new Date().toISOString(),
          usage: 'Send a POST request with endpoint, method, and token parameters'
        })
      };
    }

    // Handle POST request for making calls to Notion
    if (event.httpMethod === 'POST') {
      console.log('Handling POST request to notion-proxy');
      console.log('Request body type:', typeof event.body);
      console.log('Request body has content:', event.body ? 'Yes' : 'No');
      
      if (!event.body) {
        console.error('Request body is missing');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing request body' })
        };
      }
      
      // Parse body
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
        console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
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
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required parameter: endpoint' })
        };
      }

      if (!token) {
        console.error('Missing token parameter');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required parameter: token' })
        };
      }

      // Build full Notion API URL
      const targetUrl = `${NOTION_API_BASE}${endpoint}`;
      console.log(`Target URL: ${targetUrl}`);

      // Prepare headers for Notion API
      const notionHeaders = {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      };
      
      console.log(`Making ${method || 'GET'} request to Notion API with headers:`, notionHeaders);
      
      // Make request to Notion API
      try {
        const fetch = require('node-fetch');
        const notionResponse = await fetch(targetUrl, {
          method: method || 'GET',
          headers: notionHeaders,
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
          return {
            statusCode: notionResponse.status,
            headers: { ...headers, 'Content-Type': 'text/plain' },
            body: textResponse
          };
        }

        // Return Notion API response
        return {
          statusCode: notionResponse.status,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(responseData)
        };
      } catch (fetchError) {
        console.error('Fetch error when calling Notion API:', fetchError);
        return {
          statusCode: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Failed to fetch from Notion API',
            message: fetchError.message || 'Unknown fetch error'
          })
        };
      }
    }

    // Method not supported
    console.error(`Unsupported method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only supports GET and POST methods'
      })
    };
  } catch (error) {
    console.error('Notion proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
}
