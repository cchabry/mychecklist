
/**
 * Module de proxy de secours pour l'API Notion
 * 
 * NOTE: Ce module est maintenant obsolète car tous les appels
 * passent par les fonctions Netlify. Il est conservé pour la compatibilité
 * avec le code existant, mais toutes les fonctions redirigent vers
 * les fonctions Netlify.
 */

import { toast } from 'sonner';

// Options de configuration
const CONFIG = {
  // URL de base de l'API Notion
  NOTION_API_BASE: 'https://api.notion.com/v1',
  // Version de l'API Notion
  NOTION_API_VERSION: '2022-06-28',
  // Délai avant timeout (en ms)
  TIMEOUT_MS: 15000,
};

/**
 * Effectue une requête via les fonctions Netlify
 */
export const fallbackNotionRequest = async (
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  try {
    // Récupérer la clé API
    const token = apiKey || localStorage.getItem('notion_api_key');
    if (!token) {
      throw new Error('Clé API Notion introuvable');
    }
    
    // Nettoyer l'endpoint
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    console.log(`🔄 Utilisation des fonctions Netlify pour l'appel à l'API Notion: ${normalizedEndpoint}`);
    
    // Utiliser la fonction Netlify pour les appels à l'API Notion
    const response = await fetch('/.netlify/functions/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: normalizedEndpoint,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body.toString()) : undefined,
        token
      })
    });
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur API Notion: ${response.status} - ${errorText}`);
      throw new Error(`Erreur API Notion: ${response.status} - ${errorText}`);
    }
    
    // Traiter la réponse JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel à la fonction Netlify:', error);
    
    toast.error('Erreur de l\'API Notion', {
      description: error.message || 'Erreur inconnue lors de l\'appel à l\'API Notion',
    });
    
    throw error;
  }
};

/**
 * Ces fonctions sont conservées pour la compatibilité mais ne font rien
 */
export const findWorkingCorsProxy = async (): Promise<string> => {
  return '/.netlify/functions/notion-proxy';
};

export const resetCorsProxyCache = () => {
  // Ne fait rien car on utilise toujours les fonctions Netlify
};
