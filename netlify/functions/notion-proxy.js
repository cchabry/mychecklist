
/**
 * Fonction Netlify pour le proxy Notion
 * Permet d'effectuer des requêtes à l'API Notion en contournant les limitations CORS
 */

// Configuration de base
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';
const DEBUG = process.env.DEBUG === 'true' || true; // Activer le débogage par défaut

/**
 * Journalise un message de debug
 */
function logDebug(message, data) {
  if (DEBUG) {
    console.log(`[Notion Proxy] ${message}`, data || '');
  }
}

/**
 * Normalise le token d'authentification pour l'API Notion
 */
function normalizeToken(token) {
  if (!token) return null;
  
  // Déjà au format correct
  if (token.startsWith('Bearer ')) {
    return token;
  }
  
  // Clé d'intégration Notion ou Token OAuth
  if (token.startsWith('secret_') || token.startsWith('ntn_')) {
    return `Bearer ${token}`;
  }
  
  // Format inconnu, utiliser tel quel
  return `Bearer ${token}`;
}

/**
 * Prépare les en-têtes CORS pour les réponses
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,Notion-Version,X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 heures
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Referrer-Policy': 'no-referrer-when-downgrade'
  };
}

/**
 * Formate et renvoie une réponse d'erreur
 */
function sendError(statusCode, message, details = {}) {
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify({
      error: message,
      ...details,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Fonction principale de gestion des requêtes
 */
exports.handler = async (event, context) => {
  logDebug(`Requête reçue: ${event.httpMethod}`, event.body ? 'avec body' : 'sans body');
  
  // En-têtes CORS complets pour toutes les réponses
  const headers = getCorsHeaders();
  
  // Requête preflight OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    logDebug('Requête OPTIONS (preflight) reçue');
    return {
      statusCode: 204, // No Content
      headers
    };
  }
  
  // Vérification de l'état du proxy (requête ping simple)
  if (event.httpMethod === 'GET' || (event.body && JSON.parse(event.body)?.ping === true)) {
    logDebug('Requête de vérification d\'état reçue');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Notion API Proxy fonctionnel',
        version: '1.0.2',
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString()
      })
    };
  }
  
  // La requête doit être une méthode POST avec un corps valide
  if (event.httpMethod !== 'POST') {
    logDebug(`Méthode non autorisée: ${event.httpMethod}`);
    return sendError(405, 'Méthode non autorisée', { 
      supportedMethod: 'POST',
      receivedMethod: event.httpMethod
    });
  }
  
  // Vérifier si le corps de la requête existe
  if (!event.body) {
    logDebug('Corps de requête manquant');
    return sendError(400, 'Corps de requête manquant');
  }
  
  // Parser le corps de la requête
  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
    logDebug('Corps de requête parsé avec succès', requestBody.endpoint);
  } catch (error) {
    logDebug('JSON invalide dans le corps de la requête', error);
    return sendError(400, 'JSON invalide dans le corps de la requête', { 
      error: error.message 
    });
  }
  
  // Extraire les paramètres de la requête
  const { endpoint, method = 'GET', body, token } = requestBody;
  
  // Valider les paramètres requis
  if (!endpoint) {
    logDebug('Paramètre manquant: endpoint', Object.keys(requestBody));
    return sendError(400, 'Paramètre manquant: endpoint', { 
      receivedParameters: Object.keys(requestBody).join(', ') 
    });
  }
  
  if (!token) {
    logDebug('Paramètre manquant: token', Object.keys(requestBody));
    return sendError(400, 'Paramètre manquant: token', { 
      receivedParameters: Object.keys(requestBody).join(', ') 
    });
  }
  
  // Vérifier si c'est un token de test
  if (token === 'test_token' || token === 'test_token_for_proxy_test') {
    logDebug('Test de connectivité avec token de test');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Test de connectivité proxy réussi',
        actualApi: false,
        timestamp: new Date().toISOString()
      })
    };
  }
  
  // Normaliser l'endpoint
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${NOTION_API_BASE}${normalizedEndpoint}`;
  logDebug(`Requête ${method} vers ${targetUrl}`);
  
  // Préparer le token d'authentification
  const authToken = normalizeToken(token);
  if (!authToken) {
    logDebug('Token d\'authentification invalide');
    return sendError(400, 'Token d\'authentification invalide');
  }
  
  try {
    // Importer fetch pour les requêtes HTTP
    const fetch = require('node-fetch');
    
    // En-têtes pour la requête à l'API Notion
    const notionHeaders = {
      'Authorization': authToken,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
      'User-Agent': 'Netlify Function Notion Proxy'
    };
    
    logDebug(`Envoi de requête à Notion: ${method} ${targetUrl}`, {
      headers: notionHeaders,
      hasBody: !!body
    });
    
    // Effectuer la requête à l'API Notion
    const startTime = Date.now();
    const notionResponse = await fetch(targetUrl, {
      method,
      headers: notionHeaders,
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined
    });
    const responseTime = Date.now() - startTime;
    
    logDebug(`Réponse reçue en ${responseTime}ms avec statut: ${notionResponse.status}`);
    
    // Récupérer le corps de la réponse
    const responseText = await notionResponse.text();
    let responseData;
    
    try {
      // Tenter de parser la réponse comme JSON
      responseData = JSON.parse(responseText);
      logDebug('Réponse parsée comme JSON avec succès');
    } catch (error) {
      // Si ce n'est pas du JSON, renvoyer le texte brut
      logDebug('La réponse n\'est pas au format JSON', responseText.substring(0, 100));
      return {
        statusCode: notionResponse.status,
        headers,
        body: responseText
      };
    }
    
    // Retourner la réponse
    return {
      statusCode: notionResponse.status,
      headers: {
        ...headers,
        'X-Response-Time': `${responseTime}ms`
      },
      body: JSON.stringify(responseData)
    };
    
  } catch (error) {
    // Erreur lors de la requête
    logDebug('Erreur lors de la communication avec l\'API Notion', error);
    return sendError(500, 'Erreur lors de la communication avec l\'API Notion', {
      message: error.message,
      endpoint: normalizedEndpoint,
      method
    });
  }
};
