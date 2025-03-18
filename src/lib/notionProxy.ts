import { toast } from 'sonner';

// URL de base pour l'API Notion (direct ou via proxy)
const NOTION_API_BASE = 'https://api.notion.com/v1';
// URL de notre fonction serverless Vercel déployée
const VERCEL_PROXY_URL = 'https://mychecklist-six.vercel.app/api/notion-proxy';

// Fonction pour effectuer des requêtes à l'API Notion (directement ou via proxy)
export const notionApiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  // Récupérer la clé API depuis les paramètres ou localStorage
  const token = apiKey || localStorage.getItem('notion_api_key');
  
  if (!token) {
    throw new Error('Clé API Notion introuvable');
  }
  
  // Préparer les en-têtes avec l'autorisation
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
    ...options.headers
  };

  try {
    // Ajouter un timeout à la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    let response;
    let result;
    
    // Essayer d'utiliser le proxy Vercel d'abord
    try {
      console.log(`Utilisation du proxy Vercel pour: ${endpoint}`);
      
      // Préparer les données pour le proxy
      const proxyData = {
        endpoint,
        method: options.method || 'GET',
        token,
        body: options.body ? JSON.parse(options.body as string) : undefined
      };
      
      // Appeler le proxy Vercel
      response = await fetch(VERCEL_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proxyData),
        signal: controller.signal
      });
      
      result = await response.json();
      
      // Si le proxy a répondu avec succès
      if (response.ok) {
        clearTimeout(timeoutId);
        return result;
      } else {
        // Si le proxy a échoué mais que ce n'est pas une erreur CORS, retourner l'erreur
        if (!response.statusText.includes('cors') && !response.statusText.includes('Failed to fetch')) {
          throw new Error(`Erreur proxy: ${result.error || response.statusText}`);
        }
        // Sinon, essayer l'appel direct (qui échouera probablement avec CORS)
      }
    } catch (proxyError) {
      console.warn('Échec de l\'utilisation du proxy, tentative d\'appel direct:', proxyError);
      // Continuer avec l'appel direct si le proxy a échoué
    }
    
    // Appel direct à l'API Notion (qui échouera probablement avec CORS dans le navigateur)
    console.log(`Tentative d'appel direct à l'API Notion: ${NOTION_API_BASE}${endpoint}`);
    
    response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('Erreur API Notion:', errorData);
      
      // Gérer les codes d'erreur courants
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification Notion: Clé API invalide ou expirée');
      }
      
      if (response.status === 404) {
        throw new Error('Ressource Notion introuvable: Vérifiez l\'ID de la base de données');
      }
      
      if (response.status === 429) {
        throw new Error('Trop de requêtes Notion: Veuillez réessayer plus tard');
      }
      
      throw new Error(`Erreur Notion: ${errorData.message || response.statusText || 'Erreur inconnue'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Échec de la requête Notion:', error);
    
    // Gérer les erreurs spécifiques
    if (error.name === 'AbortError') {
      toast.error('Requête Notion expirée', {
        description: 'La connexion à Notion a pris trop de temps. Vérifiez votre connexion internet.',
      });
      throw new Error('Délai d\'attente de la requête Notion dépassé');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      const corsError = new Error('Failed to fetch');
      corsError.message = 'Failed to fetch - Limitation CORS';
      throw corsError;
    }
    
    throw error;
  }
};

// Points d'accès spécifiques à l'API
export const notionApi = {
  // Points d'accès pour les utilisateurs
  users: {
    me: async (apiKey?: string) => {
      try {
        return await notionApiRequest('/users/me', {}, apiKey);
      } catch (error) {
        console.error('Échec de la récupération de l\'utilisateur Notion:', error);
        throw error;
      }
    }
  },
  
  // Points d'accès pour les bases de données
  databases: {
    query: async (databaseId: string, params: any = {}, apiKey?: string) => {
      try {
        // S'assurer que l'ID de la base de données est propre
        const cleanId = databaseId.replace(/-/g, '');
        return await notionApiRequest(`/databases/${cleanId}/query`, {
          method: 'POST',
          body: JSON.stringify(params)
        }, apiKey);
      } catch (error) {
        console.error(`Échec de la requête à la base de données Notion ${databaseId}:`, error);
        throw error;
      }
    },
    
    retrieve: async (databaseId: string, apiKey?: string) => {
      try {
        // S'assurer que l'ID de la base de données est propre
        const cleanId = databaseId.replace(/-/g, '');
        return await notionApiRequest(`/databases/${cleanId}`, {}, apiKey);
      } catch (error) {
        console.error(`Échec de la récupération de la base de données Notion ${databaseId}:`, error);
        throw error;
      }
    }
  },
  
  // Points d'accès pour les pages
  pages: {
    retrieve: async (pageId: string, apiKey?: string) => {
      try {
        return await notionApiRequest(`/pages/${pageId}`, {}, apiKey);
      } catch (error) {
        console.error(`Échec de la récupération de la page Notion ${pageId}:`, error);
        throw error;
      }
    },
    
    create: async (params: any, apiKey?: string) => {
      try {
        return await notionApiRequest('/pages', {
          method: 'POST',
          body: JSON.stringify(params)
        }, apiKey);
      } catch (error) {
        console.error('Échec de la création de la page Notion:', error);
        throw error;
      }
    },
    
    update: async (pageId: string, params: any, apiKey?: string) => {
      try {
        return await notionApiRequest(`/pages/${pageId}`, {
          method: 'PATCH',
          body: JSON.stringify(params)
        }, apiKey);
      } catch (error) {
        console.error(`Échec de la mise à jour de la page Notion ${pageId}:`, error);
        throw error;
      }
    }
  },
  
  // Support pour les données de test
  mockMode: {
    isActive: (): boolean => {
      // Vérifier si on est en mode mock (pas de vraie API Notion)
      return localStorage.getItem('notion_mock_mode') === 'true';
    },
    activate: (): void => {
      localStorage.setItem('notion_mock_mode', 'true');
      console.log('Mode mock Notion activé');
    },
    deactivate: (): void => {
      localStorage.removeItem('notion_mock_mode');
      console.log('Mode mock Notion désactivé');
    }
  }
};
