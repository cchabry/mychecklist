
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Notion Proxy API handler
 * Cette fonction sert de proxy entre le client et l'API Notion pour contourner les limitations CORS
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  console.log('==========================================');
  console.log('⚡ [Notion Proxy] Fonction API appelée');
  console.log('Méthode:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:', JSON.stringify(request.headers, null, 2));
  console.log('==========================================');

  // Configuration CORS avancée
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  // Autoriser n'importe quelle origine pour le développement, à restreindre en production
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version');

  // Désactiver la mise en cache pour toutes les réponses
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  // Gérer les requêtes OPTIONS (pre-flight CORS)
  if (request.method === 'OPTIONS') {
    console.log('🔄 [Notion Proxy] Répondre à la requête OPTIONS (CORS preflight)');
    return response.status(200).end();
  }
  
  // Pour les requêtes HEAD, retourner un statut 200 pour indiquer que l'endpoint existe
  if (request.method === 'HEAD') {
    console.log('🔄 [Notion Proxy] Répondre à la requête HEAD (vérification d\'existence)');
    return response.status(200).end();
  }
  
  // Gérer une requête ping spéciale sans nécessiter d'authentification
  if (request.method === 'POST' && request.body?.endpoint === '/ping') {
    console.log('📡 [Notion Proxy] Requête ping reçue');
    return response.status(200).json({
      status: 'ok',
      message: 'Notion proxy is working correctly',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('📥 [Notion Proxy] Traitement de la requête:', request.method, request.url);
  
  try {
    // Extraire les informations de la requête
    const { endpoint, method = 'GET', body, token } = request.body || {};
    
    console.log('📋 [Notion Proxy] Détails de la requête:', { 
      endpoint, 
      method,
      hasBody: !!body,
      hasToken: !!token,
      bodyKeys: body ? Object.keys(body) : []
    });
    
    // Vérifier les paramètres requis
    if (!endpoint || !token) {
      console.error('❌ [Notion Proxy] Paramètres manquants:', { hasEndpoint: !!endpoint, hasToken: !!token });
      return response.status(400).json({ 
        error: 'Paramètres manquants: endpoint et token sont requis',
        received: { hasEndpoint: !!endpoint, hasToken: !!token }
      });
    }
    
    // Construire l'URL complète pour l'API Notion
    const url = `https://api.notion.com/v1${endpoint}`;
    
    console.log(`🔗 [Notion Proxy] Préparation de la requête ${method} vers ${url}`);
    
    // Définir les options de la requête
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      // Ajouter un timeout de 25 secondes
      signal: AbortSignal.timeout(25000)
    };
    
    // Ajouter le corps de la requête si nécessaire
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
      console.log('📦 [Notion Proxy] Corps de la requête ajouté:', typeof fetchOptions.body, 'taille:', fetchOptions.body.length);
    }
    
    // Effectuer la requête à l'API Notion
    console.log('🚀 [Notion Proxy] Envoi de la requête à l\'API Notion...');
    const notionResponse = await fetch(url, fetchOptions);
    console.log('✅ [Notion Proxy] Réponse reçue de l\'API Notion:', notionResponse.status, notionResponse.statusText);
    
    // Récupérer le corps de la réponse
    const responseText = await notionResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log('📄 [Notion Proxy] Réponse JSON parsée avec succès');
    } catch (parseError) {
      console.error('❌ [Notion Proxy] Erreur de parsing JSON:', parseError);
      responseData = { text: responseText };
    }
    
    // Si la réponse n'est pas OK, retourner l'erreur
    if (!notionResponse.ok) {
      console.error(`❌ [Notion Proxy] Erreur ${notionResponse.status}: ${JSON.stringify(responseData)}`);
      return response.status(notionResponse.status).json({
        error: responseData.message || 'Erreur API Notion',
        details: responseData,
        status: notionResponse.status
      });
    }
    
    // Retourner les données de l'API Notion
    console.log('✨ [Notion Proxy] Proxy réussi, renvoi de la réponse au client');
    return response.status(200).json(responseData);
  } catch (error) {
    console.error('💥 [Notion Proxy] Erreur non gérée:', error);
    
    // Formater l'erreur de manière cohérente
    const errorMessage = error.message || 'Erreur serveur inconnue';
    const errorDetails = error.stack || '';
    
    return response.status(500).json({ 
      error: 'Erreur serveur lors de la communication avec l\'API Notion',
      message: errorMessage,
      details: errorDetails
    });
  }
}
