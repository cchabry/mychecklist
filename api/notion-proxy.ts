
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurer CORS de manière plus libérale pour résoudre les problèmes de requêtes croisées
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');

  // Log pour débogage
  console.log(`[notion-proxy] Méthode: ${req.method}, URL: ${req.url}`);

  // Gérer les requêtes préliminaires OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Gérer les requêtes POST
    if (req.method === 'POST') {
      console.log('[notion-proxy] Corps de la requête POST:', typeof req.body, req.body ? 'non-vide' : 'vide');
      
      return res.status(200).json({
        success: true,
        method: 'POST',
        body: req.body || {},
        timestamp: new Date().toISOString()
      });
    }

    // Gérer les requêtes GET
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        method: 'GET',
        message: 'Notion proxy API is running',
        version: '1.0.1',
        timestamp: new Date().toISOString()
      });
    }

    // Autres méthodes non prises en charge
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `La méthode ${req.method} n'est pas prise en charge`
    });
  } catch (error) {
    // Gestion d'erreur explicite
    console.error('[notion-proxy] Erreur:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Une erreur inconnue est survenue',
      timestamp: new Date().toISOString()
    });
  }
}
