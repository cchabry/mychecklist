
/**
 * Fonction Netlify pour le proxy Notion
 * Permet d'effectuer des requêtes à l'API Notion en contournant les limitations CORS
 * Implémente un système de cache efficace pour améliorer les performances
 */

// Configuration de base
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

// Configuration du cache
const DEFAULT_CACHE_TTL = 60; // TTL par défaut (en secondes)
const CACHE_CONFIG = {
  // Endpoints avec un TTL court (données qui changent fréquemment)
  shortTtl: {
    pattern: /\/databases\/.*\/query|\/search/,
    ttl: 30, // 30 secondes
  },
  // Endpoints avec un TTL moyen
  mediumTtl: {
    pattern: /\/pages\/.*|\/blocks\/.*\/children/,
    ttl: 120, // 2 minutes
  },
  // Endpoints avec un TTL long (données qui changent rarement)
  longTtl: {
    pattern: /\/databases\/[^/]+$|\/users|\/users\/me/,
    ttl: 300, // 5 minutes
  }
};

// Système de cache en mémoire simple
const cache = {
  store: new Map(),
  
  /**
   * Détermine le TTL approprié pour un endpoint
   */
  getTtl(method, endpoint) {
    // Pas de cache pour les requêtes non-GET
    if (method !== 'GET') return 0;
    
    // Chercher dans la configuration par motif
    for (const [key, config] of Object.entries(CACHE_CONFIG)) {
      if (config.pattern.test(endpoint)) {
        return config.ttl;
      }
    }
    
    // TTL par défaut
    return DEFAULT_CACHE_TTL;
  },
  
  /**
   * Génère une clé de cache unique
   */
  getKey(method, endpoint, token) {
    // Format: METHOD:ENDPOINT:TOKEN_HASH
    // Utiliser uniquement les 8 premiers caractères du token pour éviter de stocker
    // des informations sensibles complètes dans la clé de cache
    const tokenHash = token.slice(-8);
    return `${method}:${endpoint}:${tokenHash}`;
  },
  
  /**
   * Met en cache une réponse
   */
  set(method, endpoint, token, responseData, status) {
    const ttl = this.getTtl(method, endpoint);
    
    // Ne pas mettre en cache si TTL = 0
    if (ttl <= 0) return false;
    
    const key = this.getKey(method, endpoint, token);
    const expiryTime = Date.now() + (ttl * 1000);
    
    this.store.set(key, {
      data: responseData,
      status,
      expiry: expiryTime
    });
    
    return true;
  },
  
  /**
   * Récupère une réponse du cache
   */
  get(method, endpoint, token) {
    const key = this.getKey(method, endpoint, token);
    const entry = this.store.get(key);
    
    // Aucune entrée en cache
    if (!entry) return null;
    
    // Vérifier si l'entrée a expiré
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  },
  
  /**
   * Nettoie les entrées expirées
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
};

/**
 * Journalise un message si le mode debug est activé
 */
function logDebug(message, data) {
  if (process.env.DEBUG === 'true') {
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
  
  // Clé d'intégration Notion
  if (token.startsWith('secret_')) {
    return `Bearer ${token}`;
  }
  
  // Token OAuth Notion
  if (token.startsWith('ntn_')) {
    return `Bearer ${token}`;
  }
  
  // Format inconnu, utiliser tel quel
  return token;
}

/**
 * Formate et renvoie une réponse d'erreur
 */
function sendError(statusCode, message, details = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,Notion-Version',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    },
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
  // Nettoyer le cache des entrées expirées
  const cleanedEntries = cache.cleanup();
  if (cleanedEntries > 0) {
    logDebug(`Cache nettoyé: ${cleanedEntries} entrées supprimées`);
  }
  
  // En-têtes CORS communs pour toutes les réponses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,Notion-Version',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Requête preflight OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers
    };
  }
  
  // Vérification de l'état du proxy (requête GET simple)
  if (event.httpMethod === 'GET' && !event.queryStringParameters) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Notion API Proxy fonctionnel',
        version: '2.0.0',
        cache: {
          size: cache.store.size,
          ttl: DEFAULT_CACHE_TTL
        },
        timestamp: new Date().toISOString()
      })
    };
  }
  
  // La requête doit être une méthode POST avec un corps valide
  if (event.httpMethod !== 'POST') {
    return sendError(405, 'Méthode non autorisée', { 
      supportedMethod: 'POST',
      receivedMethod: event.httpMethod
    });
  }
  
  // Vérifier si le corps de la requête existe
  if (!event.body) {
    return sendError(400, 'Corps de requête manquant');
  }
  
  // Parser le corps de la requête
  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (error) {
    return sendError(400, 'JSON invalide dans le corps de la requête', { 
      error: error.message 
    });
  }
  
  // Extraire les paramètres de la requête
  const { endpoint, method = 'GET', body, token } = requestBody;
  
  // Valider les paramètres requis
  if (!endpoint) {
    return sendError(400, 'Paramètre manquant: endpoint', { 
      receivedParameters: Object.keys(requestBody).join(', ') 
    });
  }
  
  if (!token) {
    return sendError(400, 'Paramètre manquant: token', { 
      receivedParameters: Object.keys(requestBody).join(', ') 
    });
  }
  
  // Vérifier si c'est un token de test
  if (token === 'test_token' || token === 'test_token_for_proxy_test') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Test de connectivité proxy réussi',
        actualApi: false
      })
    };
  }
  
  // Normaliser l'endpoint
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Vérifier si la réponse est en cache
  const cachedResponse = cache.get(method, normalizedEndpoint, token);
  if (cachedResponse) {
    logDebug(`Cache hit pour ${method} ${normalizedEndpoint}`);
    return {
      statusCode: cachedResponse.status,
      headers: {
        ...headers,
        'X-Cache': 'HIT',
        'X-Cache-Expiry': new Date(cachedResponse.expiry).toISOString()
      },
      body: JSON.stringify(cachedResponse.data)
    };
  }
  
  logDebug(`Cache miss pour ${method} ${normalizedEndpoint}`);
  
  // Construire l'URL de l'API Notion
  const targetUrl = `${NOTION_API_BASE}${normalizedEndpoint}`;
  logDebug(`Requête ${method} vers ${targetUrl}`);
  
  // Préparer le token d'authentification
  const authToken = normalizeToken(token);
  if (!authToken) {
    return sendError(400, 'Token d\'authentification invalide');
  }
  
  try {
    // Importer fetch pour les requêtes HTTP
    const fetch = require('node-fetch');
    
    // En-têtes pour la requête à l'API Notion
    const notionHeaders = {
      'Authorization': authToken,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    };
    
    // Effectuer la requête à l'API Notion
    const startTime = Date.now();
    const notionResponse = await fetch(targetUrl, {
      method,
      headers: notionHeaders,
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined
    });
    const responseTime = Date.now() - startTime;
    
    // Récupérer le corps de la réponse
    const responseText = await notionResponse.text();
    let responseData;
    
    try {
      // Tenter de parser la réponse comme JSON
      responseData = JSON.parse(responseText);
    } catch (error) {
      // Si ce n'est pas du JSON, renvoyer le texte brut
      return {
        statusCode: notionResponse.status,
        headers,
        body: responseText
      };
    }
    
    // Enrichir les erreurs d'authentification
    if (notionResponse.status === 401) {
      if (token.startsWith('ntn_')) {
        responseData.error_details = {
          type: 'oauth_token',
          message: "Ce token OAuth (ntn_) peut ne pas avoir les permissions nécessaires"
        };
      } else if (token.startsWith('secret_')) {
        responseData.error_details = {
          type: 'integration_key',
          message: "Vérifiez que votre clé d'intégration est valide et a accès à cette ressource"
        };
      }
    }
    
    // Mettre en cache les réponses réussies
    if (notionResponse.ok) {
      const cached = cache.set(method, normalizedEndpoint, token, responseData, notionResponse.status);
      logDebug(`Réponse ${cached ? 'mise en cache' : 'non mise en cache'} pour ${method} ${normalizedEndpoint}`);
    }
    
    // Retourner la réponse
    return {
      statusCode: notionResponse.status,
      headers: {
        ...headers,
        'X-Response-Time': `${responseTime}ms`,
        'X-Cache': 'MISS'
      },
      body: JSON.stringify(responseData)
    };
    
  } catch (error) {
    // Erreur lors de la requête
    return sendError(500, 'Erreur lors de la communication avec l\'API Notion', {
      message: error.message,
      endpoint: normalizedEndpoint,
      method
    });
  }
};
