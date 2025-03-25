
// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

exports.handler = async (event, context) => {
  // En-têtes CORS pour toutes les réponses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Cache-Control': 'no-cache'
  };

  // Traitement des requêtes preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Point de terminaison de test pour vérifier que la fonction est active
  if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/notion-proxy' && !event.queryStringParameters?.url) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ok',
        message: 'Notion proxy fonction serverless est opérationnelle',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    // Valider le contenu de la requête
    let requestData;
    
    // Support pour les requêtes GET avec paramètres d'URL ou POST avec body
    if (event.httpMethod === 'GET' && event.queryStringParameters?.url) {
      // Requête GET avec URL en paramètre
      requestData = {
        endpoint: '',  // Sera ignoré car nous avons une URL directe
        method: 'GET',
        token: event.headers.authorization || event.queryStringParameters.token
      };
      
      // L'URL complète est déjà fournie dans les paramètres
      const targetUrl = event.queryStringParameters.url;
      return await proxyNotionRequest(targetUrl, requestData, headers);
    } 
    else if (event.body) {
      // Requête POST standard
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Format JSON invalide', details: e.message })
        };
      }

      // Valider les champs requis
      if (!requestData.endpoint && !requestData.url) {
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'endpoint ou url requis' })
        };
      }

      if (!requestData.token) {
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'token requis' })
        };
      }

      // Construire l'URL complète pour Notion
      const targetUrl = requestData.url || `${NOTION_API_BASE}${requestData.endpoint.startsWith('/') ? requestData.endpoint : '/' + requestData.endpoint}`;
      return await proxyNotionRequest(targetUrl, requestData, headers);
    } else {
      // Ni GET avec URL ni POST avec body
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Requête invalide', details: 'La requête doit être soit GET avec un paramètre URL, soit POST avec un body' })
      };
    }
  } catch (error) {
    console.error('Erreur proxy Notion:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Erreur interne du proxy',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

/**
 * Effectue une requête à l'API Notion et renvoie la réponse
 */
async function proxyNotionRequest(url, requestData, headers) {
  const fetch = require('node-fetch');
  
  // Préparer les en-têtes pour Notion
  const notionHeaders = {
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_API_VERSION
  };

  // Formatter le token d'autorisation
  let authToken = requestData.token;
  if (authToken && !authToken.startsWith('Bearer ')) {
    authToken = `Bearer ${authToken}`;
  }
  
  if (authToken) {
    notionHeaders['Authorization'] = authToken;
  }

  // Options de la requête
  const fetchOptions = {
    method: requestData.method || 'GET',
    headers: notionHeaders
  };

  // Ajouter le corps de la requête pour les méthodes non-GET
  if (requestData.body && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(requestData.body);
  }

  try {
    // Effectuer la requête à l'API Notion
    const response = await fetch(url, fetchOptions);
    const responseData = await response.json();

    // Retourner la réponse avec le même code de statut
    return {
      statusCode: response.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error(`Erreur requête Notion vers ${url}:`, error);
    throw error;
  }
}
