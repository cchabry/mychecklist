
// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';
const DEBUG = process.env.DEBUG === 'true' || false;
const CACHE_TTL = process.env.CACHE_TTL || 60; // Durée de cache en secondes (défaut: 1 minute)

// Cache simple en mémoire pour les requêtes GET
const requestCache = new Map();

/**
 * Nettoie le cache des entrées expirées
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now > entry.expiry) {
      requestCache.delete(key);
      logDebug(`Cache: entrée expirée supprimée: ${key}`);
    }
  }
}

/**
 * Génère une clé de cache pour une requête
 */
function generateCacheKey(method, endpoint, body = {}) {
  // On ne met en cache que les requêtes GET
  if (method !== 'GET') return null;
  
  // Pour les requêtes GET, la clé est basée sur l'endpoint
  return `${method}:${endpoint}`;
}

/**
 * Journalise un message de debug si le mode debug est activé
 */
function logDebug(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

/**
 * Enrichit et journalise une erreur
 */
function logError(message, details, request = {}) {
  const timestamp = new Date().toISOString();
  const errorObj = {
    message,
    timestamp,
    details,
    request: {
      method: request.method,
      endpoint: request.endpoint,
      hasBody: !!request.body,
      hasToken: !!request.token
    }
  };
  
  console.error(`[${timestamp}] ERREUR: ${message}`, errorObj);
  return errorObj;
}

/**
 * Handler principal de la fonction Netlify
 */
exports.handler = async (event, context) => {
  // Nettoyer le cache des entrées expirées
  cleanupCache();
  
  // Préparer les en-têtes CORS pour toutes les réponses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Notion-Version',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
  
  // Métrique de performance pour le temps d'exécution
  const startTime = Date.now();
  let responseStatus = 200;
  let responseSize = 0;
  let cacheHit = false;
  
  try {
    logDebug(`Netlify function: Notion proxy reçoit une requête: ${event.httpMethod} ${event.path}`);
    
    // Gérer les requêtes OPTIONS (preflight CORS)
    if (event.httpMethod === 'OPTIONS') {
      logDebug('Gestion d\'une requête OPTIONS preflight');
      return {
        statusCode: 204, // No Content pour preflight
        headers,
        body: ''
      };
    }
    
    // Gérer les requêtes GET pour tester le proxy
    if (event.httpMethod === 'GET' && !event.path.includes('?')) {
      logDebug('Gestion d\'une requête GET pour tester le proxy');
      const responseBody = {
        status: 'ok',
        message: 'Notion proxy fonctionne sur Netlify',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        usage: 'Envoyez une requête POST avec les paramètres endpoint, method et token'
      };
      
      responseSize = JSON.stringify(responseBody).length;
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(responseBody)
      };
    }
    
    // Gérer les requêtes POST pour les appels à Notion
    if (event.httpMethod === 'POST') {
      logDebug('Gestion d\'une requête POST pour appel à l\'API Notion');
      
      // Vérifier que le corps de la requête existe
      if (!event.body) {
        responseStatus = 400;
        const error = logError('Corps de requête manquant', { detail: 'Le corps est requis pour les requêtes POST' });
        
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Corps de requête manquant',
            details: 'Le corps est requis pour les requêtes POST'
          })
        };
      }
      
      // Parser le corps de la requête
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
        logDebug('Corps parsé:', JSON.stringify(parsedBody, null, 2));
      } catch (parseError) {
        responseStatus = 400;
        const error = logError('JSON invalide dans le corps de la requête', { 
          error: parseError.message, 
          receivedBody: event.body 
        });
        
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'JSON invalide dans le corps de la requête',
            details: parseError.message,
            receivedBody: event.body
          })
        };
      }
      
      const { endpoint, method, body, token } = parsedBody;
      
      // Valider les paramètres requis
      if (!endpoint) {
        responseStatus = 400;
        const error = logError('Paramètre manquant: endpoint', { 
          receivedParameters: Object.keys(parsedBody).join(', ') 
        }, parsedBody);
        
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Paramètre manquant: endpoint',
            receivedParameters: Object.keys(parsedBody).join(', ')
          })
        };
      }
      
      if (!token) {
        responseStatus = 400;
        const error = logError('Paramètre manquant: token', { 
          receivedParameters: Object.keys(parsedBody).join(', ') 
        }, parsedBody);
        
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Paramètre manquant: token',
            receivedParameters: Object.keys(parsedBody).join(', ')
          })
        };
      }
      
      // Vérifier si c'est un token de test (pour la vérification de connectivité)
      if (token === 'test_token' || token === 'test_token_for_proxy_test') {
        logDebug('Token de test détecté, il s\'agit d\'un simple test de connectivité');
        
        const responseBody = {
          status: 'ok',
          message: 'Test de connectivité proxy réussi',
          note: 'Il s\'agissait simplement d\'un test de connectivité avec un token de test',
          actualApi: false
        };
        
        responseSize = JSON.stringify(responseBody).length;
        
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(responseBody)
        };
      }
      
      // Vérifier si la requête est en cache (uniquement pour GET)
      const httpMethod = method || 'GET';
      const cacheKey = generateCacheKey(httpMethod, endpoint, body);
      
      if (cacheKey && requestCache.has(cacheKey)) {
        const cachedEntry = requestCache.get(cacheKey);
        if (Date.now() < cachedEntry.expiry) {
          logDebug(`Cache hit pour: ${cacheKey}`);
          cacheHit = true;
          responseSize = cachedEntry.size;
          
          // Ajouter des informations sur le cache dans les en-têtes
          const cacheHeaders = {
            'X-Cache': 'HIT',
            'X-Cache-Expiry': new Date(cachedEntry.expiry).toISOString(),
            'X-Cache-Key': cacheKey
          };
          
          return {
            statusCode: cachedEntry.status,
            headers: { ...headers, ...cacheHeaders, 'Content-Type': 'application/json' },
            body: cachedEntry.data
          };
        } else {
          // L'entrée est expirée, la supprimer du cache
          requestCache.delete(cacheKey);
          logDebug(`Cache: entrée expirée supprimée: ${cacheKey}`);
        }
      }
      
      // Construire l'URL complète de l'API Notion
      const targetUrl = `${NOTION_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      logDebug(`URL cible: ${targetUrl}`);
      
      // Préparer le token d'authentification au format Bearer
      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        // Si c'est juste le token brut, ajouter le préfixe Bearer
        if (token.startsWith('secret_') || token.startsWith('ntn_')) {
          authToken = `Bearer ${token}`;
          logDebug(`Token formaté avec préfixe Bearer pour l'API Notion`);
          logDebug(`Type de token: ${token.startsWith('secret_') ? 'Clé d\'intégration' : 'Token OAuth'}`);
        }
      }
      
      // Préparer les en-têtes pour l'API Notion
      const notionHeaders = {
        'Authorization': authToken,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      };
      
      logDebug(`Envoi d'une requête ${httpMethod} à l'API Notion avec les en-têtes:`, {
        'Notion-Version': notionHeaders['Notion-Version'],
        'Content-Type': notionHeaders['Content-Type'],
        'Authorization': '***' // Masquer le token pour la sécurité
      });
      
      // Mesure du temps de réponse de l'API Notion
      const apiCallStartTime = Date.now();
      
      // Faire la requête à l'API Notion
      try {
        const fetch = require('node-fetch');
        const notionResponse = await fetch(targetUrl, {
          method: httpMethod,
          headers: notionHeaders,
          body: body && httpMethod !== 'GET' ? JSON.stringify(body) : undefined
        });
        
        const apiCallDuration = Date.now() - apiCallStartTime;
        logDebug(`Réponse API Notion reçue en ${apiCallDuration}ms avec statut: ${notionResponse.status}`);
        
        // Récupérer le corps de la réponse
        let responseData;
        let responseText;
        
        try {
          responseText = await notionResponse.text();
          logDebug(`Aperçu du texte de réponse: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
          
          // Essayer de parser en JSON
          try {
            responseData = JSON.parse(responseText);
            logDebug('Réponse parsée en JSON:', typeof responseData);
            
            // Si erreur d'authentification (401), ajouter des détails
            if (notionResponse.status === 401) {
              logDebug('Erreur d\'authentification depuis l\'API Notion');
              
              // Ajouter des détails spécifiques selon le type de token
              if (token && token.startsWith('ntn_')) {
                responseData.error_details = {
                  type: 'oauth_token',
                  message: "Ce token OAuth (ntn_) peut ne pas fonctionner avec certaines API d'intégration",
                  help: "Certaines API d'intégration nécessitent une clé d'intégration (secret_) au lieu d'un token OAuth"
                };
              } else if (token && token.startsWith('secret_')) {
                responseData.error_details = {
                  type: 'integration_key',
                  message: "Veuillez vérifier que votre clé d'intégration est valide et n'a pas expiré",
                  help: "Assurez-vous que votre intégration a accès à la base de données et aux pages"
                };
              } else {
                responseData.error_details = {
                  type: 'authentication_error',
                  message: "Veuillez vérifier que votre clé d'API est valide et n'a pas expiré",
                  help: "Les clés doivent être utilisées avec le préfixe 'Bearer'"
                };
              }
            }
          } catch (jsonError) {
            logDebug('Impossible de parser la réponse en JSON, renvoi sous forme de texte');
            responseStatus = notionResponse.status;
            
            return {
              statusCode: notionResponse.status,
              headers: { ...headers, 'Content-Type': 'text/plain' },
              body: responseText
            };
          }
        } catch (textError) {
          responseStatus = 500;
          const error = logError('Impossible de lire le texte de réponse', { error: textError.message });
          
          return {
            statusCode: 500,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: 'Impossible de lire la réponse de l\'API Notion',
              message: textError.message
            })
          };
        }
        
        responseStatus = notionResponse.status;
        const responseBody = JSON.stringify(responseData);
        responseSize = responseBody.length;
        
        // Mettre en cache la réponse si c'est une requête GET réussie
        if (cacheKey && notionResponse.ok) {
          const now = Date.now();
          requestCache.set(cacheKey, {
            data: responseBody,
            status: notionResponse.status,
            expiry: now + (CACHE_TTL * 1000),
            timestamp: now,
            size: responseBody.length
          });
          logDebug(`Réponse mise en cache pour: ${cacheKey} (expire dans ${CACHE_TTL}s)`);
        }
        
        // Ajouter des informations de performance dans les en-têtes
        const perfHeaders = {
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-API-Response-Time': `${apiCallDuration}ms`,
          'X-Cache': 'MISS'
        };
        
        // Retourner la réponse de l'API Notion
        return {
          statusCode: notionResponse.status,
          headers: { ...headers, ...perfHeaders, 'Content-Type': 'application/json' },
          body: responseBody
        };
        
      } catch (fetchError) {
        responseStatus = 500;
        const error = logError('Erreur fetch lors de l\'appel à l\'API Notion', { 
          error: fetchError.message || 'Erreur fetch inconnue' 
        }, { endpoint, method: httpMethod });
        
        return {
          statusCode: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Impossible de contacter l\'API Notion',
            message: fetchError.message || 'Erreur fetch inconnue'
          })
        };
      }
    }
    
    // Méthode non supportée
    responseStatus = 405;
    const error = logError(`Méthode non supportée: ${event.httpMethod}`, { 
      receivedMethod: event.httpMethod 
    });
    
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Méthode non autorisée',
        message: 'Cet endpoint ne supporte que les méthodes GET et POST',
        receivedMethod: event.httpMethod
      })
    };
    
  } catch (error) {
    responseStatus = 500;
    const loggedError = logError('Erreur interne du proxy Notion', { 
      error: error.message || 'Erreur inconnue',
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Erreur interne du serveur',
        message: error.message || 'Erreur inconnue',
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      })
    };
  } finally {
    // Journalisation des métriques de performance
    const duration = Date.now() - startTime;
    logDebug(`Requête traitée en ${duration}ms | Statut: ${responseStatus} | Taille: ${responseSize} octets | Cache: ${cacheHit ? 'HIT' : 'MISS'}`);
  }
};
