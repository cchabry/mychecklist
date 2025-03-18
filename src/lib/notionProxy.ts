
import { toast } from 'sonner';

// Base URL for Notion API
const NOTION_API_BASE = 'https://api.notion.com/v1';

// Function to make Notion API requests through a proxy pattern
export const notionApiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  apiKey?: string
): Promise<any> => {
  // Get API key from params or localStorage
  const token = apiKey || localStorage.getItem('notion_api_key');
  
  if (!token) {
    throw new Error('Notion API key not found');
  }
  
  // Prepare headers with authorization
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
    ...options.headers
  };
  
  try {
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout (increased from 10s)
    
    console.log(`Fetching Notion API: ${NOTION_API_BASE}${endpoint}`);
    
    const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Notion API error:', errorData);
      
      // Handle common error codes
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
    console.error('Notion request failed:', error);
    
    // Handle specific errors
    if (error.name === 'AbortError') {
      toast.error('Requête Notion expirée', {
        description: 'La connexion à Notion a pris trop de temps. Vérifiez votre connexion internet.',
      });
      throw new Error('Notion request timeout');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      toast.error('Erreur de connexion à Notion', {
        description: 'Vérifiez votre connexion internet et les paramètres réseau',
      });
    }
    
    throw error;
  }
};

// Specific API endpoints
export const notionApi = {
  // User-related endpoints
  users: {
    me: async (apiKey?: string) => {
      try {
        return await notionApiRequest('/users/me', {}, apiKey);
      } catch (error) {
        console.error('Failed to get Notion user:', error);
        throw error;
      }
    }
  },
  
  // Database endpoints
  databases: {
    query: async (databaseId: string, params: any = {}, apiKey?: string) => {
      try {
        // Ensure the database ID is clean
        const cleanId = databaseId.replace(/-/g, '');
        return await notionApiRequest(`/databases/${cleanId}/query`, {
          method: 'POST',
          body: JSON.stringify(params)
        }, apiKey);
      } catch (error) {
        console.error(`Failed to query Notion database ${databaseId}:`, error);
        throw error;
      }
    },
    
    retrieve: async (databaseId: string, apiKey?: string) => {
      try {
        // Ensure the database ID is clean
        const cleanId = databaseId.replace(/-/g, '');
        return await notionApiRequest(`/databases/${cleanId}`, {}, apiKey);
      } catch (error) {
        console.error(`Failed to retrieve Notion database ${databaseId}:`, error);
        throw error;
      }
    }
  },
  
  // Page endpoints
  pages: {
    retrieve: async (pageId: string, apiKey?: string) => {
      try {
        return await notionApiRequest(`/pages/${pageId}`, {}, apiKey);
      } catch (error) {
        console.error(`Failed to retrieve Notion page ${pageId}:`, error);
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
        console.error('Failed to create Notion page:', error);
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
        console.error(`Failed to update Notion page ${pageId}:`, error);
        throw error;
      }
    }
  }
};
