
/**
 * Fonction de test pour vérifier la connexion à l'API Notion
 * Cette fonction permet de valider que le proxy fonctionne correctement
 */

exports.handler = async function(event, context) {
  // Importer fetch
  const fetch = require('node-fetch');
  
  console.log('Test de connexion à l\'API Notion depuis une fonction Netlify');
  
  // Fonctions utilitaires
  function buildResponse(statusCode, body) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
      },
      body: JSON.stringify(body)
    };
  }
  
  try {
    // Récupérer éventuellement un token de test depuis les paramètres
    let token = 'test_token';
    if (event.queryStringParameters && event.queryStringParameters.token) {
      token = event.queryStringParameters.token;
    } else if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.token) {
          token = body.token;
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    // Test direct à l'API Notion (fonctionnera car nous sommes côté serveur)
    console.log('Test direct à l\'API Notion avec token:', token.substring(0, 5) + '...');
    
    // En-têtes pour la requête à l'API Notion
    const notionHeaders = {
      'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
    
    const directResponse = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: notionHeaders
    }).catch(error => {
      console.log('Erreur lors du test direct:', error.message);
      return { ok: false, status: 500, statusText: error.message };
    });
    
    let directApiResult = {
      success: directResponse.ok,
      status: directResponse.status,
      statusText: directResponse.statusText
    };
    
    if (directResponse.ok) {
      try {
        const data = await directResponse.json();
        directApiResult.data = {
          user: data.name || data.id,
          bot: data.bot || false
        };
      } catch (e) {
        directApiResult.parseError = e.message;
      }
    }
    
    // Test via notre proxy Netlify
    console.log('Test via le proxy Netlify');
    
    const proxyResponse = await fetch('/.netlify/functions/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: '/users/me',
        method: 'GET',
        token
      })
    }).catch(error => {
      console.log('Erreur lors du test via proxy:', error.message);
      return { ok: false, status: 500, statusText: error.message };
    });
    
    let proxyApiResult = {
      success: proxyResponse.ok,
      status: proxyResponse.status,
      statusText: proxyResponse.statusText
    };
    
    if (proxyResponse.ok) {
      try {
        const data = await proxyResponse.json();
        proxyApiResult.data = {
          user: data.name || data.id,
          bot: data.bot || false
        };
      } catch (e) {
        proxyApiResult.parseError = e.message;
      }
    }
    
    // Assembler les résultats
    const results = {
      timestamp: new Date().toISOString(),
      directApi: directApiResult,
      proxyApi: proxyApiResult,
      environment: process.env.NODE_ENV || 'unknown',
      region: context.functionName ? (context.functionName.includes('us-') ? 'US' : 'EU') : 'unknown'
    };
    
    return buildResponse(200, results);
  } catch (error) {
    console.error('Erreur inattendue lors du test:', error);
    
    return buildResponse(500, {
      error: 'Erreur lors du test de connexion à l\'API Notion',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
