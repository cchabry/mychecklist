
/**
 * Service centralisé pour tous les appels à l'API Notion
 * Ce service est le SEUL point d'entrée autorisé pour communiquer avec l'API Notion
 */

import { toast } from 'sonner';

/**
 * URL base de la fonction Netlify servant de proxy pour l'API Notion
 */
const NETLIFY_PROXY_URL = '/.netlify/functions/notion-proxy';

/**
 * Options pour les requêtes à l'API Notion
 */
export interface NotionRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string;
  showErrorToast?: boolean;
}

/**
 * Extrait un jeton Notion depuis le stockage local
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem('notion_api_key');
};

/**
 * Normalise un endpoint pour assurer la cohérence
 */
const normalizeEndpoint = (endpoint: string): string => {
  // Enlever les barres obliques de début et de fin pour la normalisation
  let cleanedEndpoint = endpoint.trim();
  
  // Gérer le cas spécial où l'endpoint est déjà complet avec /v1
  if (cleanedEndpoint.startsWith('/v1/')) {
    return cleanedEndpoint.substring(3); // Enlever le /v1 pour serverless
  }
  
  // S'assurer que l'endpoint commence par une barre oblique
  if (!cleanedEndpoint.startsWith('/')) {
    cleanedEndpoint = '/' + cleanedEndpoint;
  }
  
  return cleanedEndpoint;
};

/**
 * Effectue une requête à l'API Notion via le proxy Netlify
 * C'est la SEULE fonction qui doit être utilisée pour communiquer avec l'API Notion
 */
export async function notionRequest<T = any>(options: NotionRequestOptions): Promise<T> {
  const { endpoint, method = 'GET', body, token, showErrorToast = true } = options;
  
  // Normaliser l'endpoint
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  
  // Récupérer le token depuis le localStorage si non fourni
  const authToken = token || getStoredToken();
  
  if (!authToken) {
    const error = new Error('Token d\'authentification Notion manquant');
    if (showErrorToast) {
      toast.error('Erreur d\'authentification Notion', {
        description: 'Token d\'accès manquant. Veuillez configurer votre API Notion.'
      });
    }
    throw error;
  }
  
  try {
    console.log(`🔐 Requête Notion via proxy Netlify: ${method} ${normalizedEndpoint}`);
    
    // Utiliser EXCLUSIVEMENT la fonction Netlify
    const response = await fetch(NETLIFY_PROXY_URL, {
      method: 'POST', // Toujours POST pour la fonction Netlify
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest' // Pour identifier les requêtes AJAX
      },
      body: JSON.stringify({
        endpoint: normalizedEndpoint,
        method,
        body,
        token: authToken
      })
    });
    
    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // En cas d'échec de parsing du JSON, on utilise simplement l'erreur HTTP
      }
      
      console.error(`❌ Échec de la requête Notion: ${errorMessage}`);
      
      if (showErrorToast) {
        toast.error('Erreur lors de la requête Notion', {
          description: `Statut: ${response.status}. ${errorMessage}`
        });
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`✅ Réponse reçue pour ${method} ${normalizedEndpoint}`);
    return data as T;
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel au proxy Netlify:`, error);
    
    if (showErrorToast) {
      toast.error('Erreur de communication avec l\'API Notion', {
        description: error instanceof Error ? error.message : String(error)
      });
    }
    
    throw error;
  }
}

/**
 * Service centralisé pour l'API Notion
 * Exposant des méthodes pour chaque endpoint de l'API
 */
export const notionCentralService = {
  // Méthode principale pour toutes les requêtes
  request: notionRequest,
  
  // Méthodes de base par type de requête
  get: <T = any>(endpoint: string, token?: string) => 
    notionRequest<T>({ endpoint, method: 'GET', token }),
  
  post: <T = any>(endpoint: string, body?: any, token?: string) => 
    notionRequest<T>({ endpoint, method: 'POST', body, token }),
  
  patch: <T = any>(endpoint: string, body?: any, token?: string) => 
    notionRequest<T>({ endpoint, method: 'PATCH', body, token }),
  
  delete: <T = any>(endpoint: string, token?: string) => 
    notionRequest<T>({ endpoint, method: 'DELETE', token }),
  
  // API Utilisateurs
  users: {
    me: (token?: string) => notionRequest({ 
      endpoint: '/users/me', 
      method: 'GET', 
      token 
    }),
    
    list: (token?: string) => notionRequest({ 
      endpoint: '/users', 
      method: 'GET', 
      token 
    })
  },
  
  // API Bases de données
  databases: {
    retrieve: (databaseId: string, token?: string) => notionRequest({ 
      endpoint: `/databases/${databaseId}`, 
      method: 'GET', 
      token 
    }),
    
    query: (databaseId: string, query: any = {}, token?: string) => notionRequest({ 
      endpoint: `/databases/${databaseId}/query`, 
      method: 'POST', 
      body: query,
      token 
    }),
    
    list: (token?: string) => notionRequest({ 
      endpoint: '/search', 
      method: 'POST', 
      body: {
        filter: {
          value: 'database',
          property: 'object'
        }
      },
      token 
    })
  },
  
  // API Pages
  pages: {
    retrieve: (pageId: string, token?: string) => notionRequest({ 
      endpoint: `/pages/${pageId}`, 
      method: 'GET', 
      token 
    }),
    
    create: (data: any, token?: string) => notionRequest({ 
      endpoint: '/pages', 
      method: 'POST', 
      body: data,
      token 
    }),
    
    update: (pageId: string, data: any, token?: string) => notionRequest({ 
      endpoint: `/pages/${pageId}`, 
      method: 'PATCH', 
      body: data,
      token 
    })
  },
  
  // Test de connexion
  testConnection: async (token?: string): Promise<{ success: boolean; user?: string; error?: string }> => {
    try {
      const userData = await notionRequest({
        endpoint: '/users/me',
        method: 'GET',
        token,
        showErrorToast: false
      });
      
      return {
        success: true,
        user: userData?.name || 'Utilisateur Notion'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Exporter par défaut pour un accès facile
export default notionCentralService;
