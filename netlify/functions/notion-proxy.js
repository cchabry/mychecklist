
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
      console.log('Raw body content:', event.body);
      
      if (!event.body) {
        console.error('Request body is missing');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Missing request body',
            details: 'The request body is required for POST requests'
          })
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
          body: JSON.stringify({ 
            error: 'Invalid JSON in request body',
            details: parseError.message,
            receivedBody: event.body
          })
        };
      }
      
      const { endpoint, method, body, token } = parsedBody;
      console.log('Request parameters:', { 
        endpoint, 
        method, 
        bodyPresent: !!body, 
        tokenPresent: !!token,
        tokenLength: token ? token.length : 0,
        tokenType: token ? (token.startsWith('secret_') ? 'integration' : 
                           (token.startsWith('ntn_') ? 'oauth' : 'unknown')) : 'none',
        tokenFirstChars: token ? token.substring(0, 8) + '...' : 'none'
      });

      // Validate parameters
      if (!endpoint) {
        console.error('Missing endpoint parameter');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Missing required parameter: endpoint',
            receivedParameters: Object.keys(parsedBody).join(', ')
          })
        };
      }

      if (!token) {
        console.error('Missing token parameter');
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Missing required parameter: token',
            receivedParameters: Object.keys(parsedBody).join(', ')
          })
        };
      }

      // Vérifier le format de la clé API
      if (token === 'test_token' || token === 'test_token_for_proxy_test') {
        console.log('Test token detected, this is just a connectivity test');
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'ok',
            message: 'Test proxy connectivity successful',
            note: 'This was just a connectivity test with a test token',
            actualApi: false
          })
        };
      }

      // Vérifier si c'est un token OAuth
      if (token && token.startsWith('ntn_')) {
        console.warn('OAuth token detected instead of integration key');
        return {
          statusCode: 401,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Type de clé API incorrect',
            message: 'Vous utilisez un token OAuth (ntn_) au lieu d\'une clé d\'intégration (secret_)',
            details: 'Les tokens OAuth commençant par ntn_ ne peuvent pas être utilisés avec l\'API d\'intégration. Créez une intégration et utilisez sa clé secrète qui commence par secret_.',
            help_url: 'https://developers.notion.com/docs/authorization#integration-tokens'
          })
        };
      }

      // Build full Notion API URL
      const targetUrl = `${NOTION_API_BASE}${endpoint}`;
      console.log(`Target URL: ${targetUrl}`);

      // Préparer le token d'authentification au format Bearer
      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        // Si c'est juste le token brut, ajouter le préfixe Bearer
        if (token.startsWith('secret_')) {
          authToken = `Bearer ${token}`;
          console.log('Formatted token with Bearer prefix for Notion API');
        }
      }

      // Prepare headers for Notion API
      const notionHeaders = {
        'Authorization': authToken,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      };
      
      console.log(`Making ${method || 'GET'} request to Notion API with headers:`, {
        'Notion-Version': notionHeaders['Notion-Version'],
        'Content-Type': notionHeaders['Content-Type'],
        'Authorization': authToken.substring(0, 15) + '...'
      });
      
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
        let responseText;
        
        try {
          responseText = await notionResponse.text();
          console.log('Response text preview:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
          
          // Try to parse as JSON
          try {
            responseData = JSON.parse(responseText);
            console.log('Response parsed as JSON:', typeof responseData);
            
            // Si l'erreur est une erreur d'authentification (401), ajouter des détails
            if (notionResponse.status === 401) {
              console.log('Authentication error from Notion API');
              
              // Vérifier si c'est un token OAuth
              if (token && token.startsWith('ntn_')) {
                responseData.error_details = {
                  type: 'wrong_token_type',
                  message: 'Vous utilisez un token OAuth (ntn_) au lieu d\'une clé d\'intégration (secret_)',
                  help: 'Les tokens OAuth commençant par ntn_ ne fonctionnent pas avec l\'API d\'intégration. Créez une intégration et utilisez sa clé secrète.'
                };
              } else {
                responseData.error_details = {
                  type: 'authentication_error',
                  message: 'Veuillez vérifier que votre clé d\'API est valide et n\'a pas expiré',
                  help: 'Les clés d\'intégration commencent par "secret_" et doivent être utilisées avec le préfixe "Bearer"'
                };
              }
            }
          } catch (jsonError) {
            console.warn('Could not parse response as JSON, returning as text');
            return {
              statusCode: notionResponse.status,
              headers: { ...headers, 'Content-Type': 'text/plain' },
              body: responseText
            };
          }
        } catch (textError) {
          console.error('Failed to get response text:', textError);
          return {
            statusCode: 500,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: 'Failed to read response from Notion API',
              message: textError.message
            })
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
        message: 'This endpoint only supports GET and POST methods',
        receivedMethod: event.httpMethod
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
        message: error.message || 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      })
    };
  }
}
