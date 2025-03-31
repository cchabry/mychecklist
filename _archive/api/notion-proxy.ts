
import { NextApiRequest, NextApiResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Configuration
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';
const DEBUG = process.env.DEBUG === 'true' || false;

/**
 * Journalise un message de debug si le mode debug est activé
 */
function logDebug(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

/**
 * Handler principal de la route API Vercel
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Préparer les en-têtes CORS pour toutes les réponses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 
               'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version');

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    logDebug('Gestion d\'une requête OPTIONS preflight');
    return res.status(204).end();
  }
  
  // Gérer les requêtes GET pour tester le proxy
  if (req.method === 'GET') {
    logDebug('Gestion d\'une requête GET pour tester le proxy');
    return res.status(200).json({
      status: 'ok',
      message: 'Notion proxy fonctionne sur Vercel',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      usage: 'Envoyez une requête POST avec les paramètres endpoint, method et token'
    });
  }
  
  // Gérer les requêtes POST pour les appels à Notion
  if (req.method === 'POST') {
    logDebug('Gestion d\'une requête POST pour appel à l\'API Notion');
    
    const { endpoint, method, body, token } = req.body;
    
    // Valider les paramètres requis
    if (!endpoint) {
      return res.status(400).json({ 
        error: 'Paramètre manquant: endpoint',
        receivedParameters: Object.keys(req.body).join(', ')
      });
    }
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Paramètre manquant: token',
        receivedParameters: Object.keys(req.body).join(', ')
      });
    }
    
    // Vérifier si c'est un token de test (pour la vérification de connectivité)
    if (token === 'test_token' || token === 'test_token_for_proxy_test') {
      logDebug('Token de test détecté, il s\'agit d\'un simple test de connectivité');
      return res.status(200).json({
        status: 'ok',
        message: 'Test de connectivité proxy réussi',
        note: 'Il s\'agissait simplement d\'un test de connectivité avec un token de test',
        actualApi: false
      });
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
      }
    }
    
    // Préparer les en-têtes pour l'API Notion
    const notionHeaders: any = {
      'Authorization': authToken,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    };
    
    // Faire la requête à l'API Notion
    try {
      const httpMethod = method || 'GET';
      const notionResponse = await fetch(targetUrl, {
        method: httpMethod,
        headers: notionHeaders,
        body: body && httpMethod !== 'GET' ? JSON.stringify(body) : undefined
      });
      
      logDebug(`Réponse API Notion reçue avec statut: ${notionResponse.status}`);
      
      // Récupérer le corps de la réponse en JSON
      const responseData = await notionResponse.json();
      
      // Retourner la réponse avec le même statut
      return res.status(notionResponse.status).json(responseData);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'appel à l\'API Notion:', error);
      
      return res.status(500).json({
        error: 'Impossible de contacter l\'API Notion',
        message: error.message || 'Erreur inconnue'
      });
    }
  }
  
  // Méthode non supportée
  return res.status(405).json({
    error: 'Méthode non autorisée',
    message: 'Cet endpoint ne supporte que les méthodes GET et POST',
    receivedMethod: req.method
  });
}
