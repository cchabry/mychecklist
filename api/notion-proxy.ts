
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Notion Proxy API handler
 * Cette fonction sert de proxy entre le client et l'API Notion pour contourner les limitations CORS
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log('📡 [Notion Proxy] Demande reçue', {
    method: request.method,
    url: request.url,
    hasBody: !!request.body
  });

  // Configurer les headers CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version');
  
  // Désactiver la mise en cache
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  // Gérer les requêtes OPTIONS (pre-flight CORS)
  if (request.method === 'OPTIONS') {
    console.log('📡 [Notion Proxy] Réponse OPTIONS');
    return response.status(200).end();
  }
  
  // Pour les requêtes HEAD, retourner un statut 200
  if (request.method === 'HEAD') {
    console.log('📡 [Notion Proxy] Réponse HEAD');
    return response.status(200).end();
  }
  
  // Diagnostic pour les requêtes GET
  if (request.method === 'GET') {
    console.log('📡 [Notion Proxy] Réponse GET de diagnostic');
    return response.status(200).json({
      status: 'ok',
      message: 'Notion proxy is operational',
      timestamp: new Date().toISOString(),
      version: '1.0.5',
      environment: process.env.VERCEL_ENV || 'development'
    });
  }
  
  // Vérifier que c'est bien une requête POST
  if (request.method !== 'POST') {
    console.log(`📡 [Notion Proxy] Méthode non supportée: ${request.method}`);
    return response.status(405).json({ 
      error: `Méthode ${request.method} non supportée`,
      message: 'Seules les méthodes POST, GET, HEAD et OPTIONS sont supportées'
    });
  }
  
  try {
    // Vérifier que le corps de la requête existe
    if (!request.body) {
      console.log('📡 [Notion Proxy] Corps de requête manquant');
      return response.status(400).json({ 
        error: 'Corps de requête manquant',
        message: 'Le corps de la requête est requis pour les requêtes POST'
      });
    }
    
    // Gérer une requête ping spéciale sans nécessiter d'authentification
    if (request.body?.endpoint === '/ping') {
      console.log('📡 [Notion Proxy] Ping reçu dans le corps');
      return response.status(200).json({
        status: 'ok',
        message: 'Notion proxy is working correctly',
        timestamp: new Date().toISOString()
      });
    }
    
    // Extraire les informations de la requête
    const { endpoint, method = 'GET', body, token } = request.body || {};
    
    // Vérifier les paramètres requis
    if (!endpoint || !token) {
      console.log('📡 [Notion Proxy] Paramètres manquants', { 
        hasEndpoint: !!endpoint, 
        hasToken: !!token 
      });
      
      return response.status(400).json({ 
        error: 'Paramètres manquants: endpoint et token sont requis',
        received: { hasEndpoint: !!endpoint, hasToken: !!token }
      });
    }
    
    // Construire l'URL complète pour l'API Notion
    const url = `https://api.notion.com/v1${endpoint}`;
    console.log(`📡 [Notion Proxy] Requête vers Notion API: ${method} ${url}`);
    
    // Définir les options de la requête
    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: body && (method === 'POST' || method === 'PATCH' || method === 'PUT') 
        ? JSON.stringify(body) 
        : undefined
    };
    
    // Effectuer la requête à l'API Notion
    const notionResponse = await fetch(url, fetchOptions);
    console.log(`📡 [Notion Proxy] Réponse de Notion API: ${notionResponse.status}`);
    
    // Récupérer le corps de la réponse
    const responseText = await notionResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log('📡 [Notion Proxy] Réponse JSON parsée avec succès');
    } catch (parseError) {
      console.log('📡 [Notion Proxy] Erreur de parsing, retour en texte brut');
      responseData = { text: responseText };
    }
    
    // Si la réponse n'est pas OK, retourner l'erreur
    if (!notionResponse.ok) {
      console.log(`📡 [Notion Proxy] Erreur Notion API: ${notionResponse.status}`);
      return response.status(notionResponse.status).json({
        error: responseData.message || 'Erreur API Notion',
        details: responseData,
        status: notionResponse.status
      });
    }
    
    // Retourner les données de l'API Notion
    console.log('📡 [Notion Proxy] Succès, retour des données au client');
    return response.status(200).json(responseData);
  } catch (error) {
    // Capturer l'erreur de manière sécurisée
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur inconnue';
    console.error('📡 [Notion Proxy] Erreur serveur:', errorMessage);
    
    return response.status(500).json({ 
      error: 'Erreur serveur lors de la communication avec l\'API Notion',
      message: errorMessage
    });
  }
}
