
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      throw new Error(`Notion API error: ${error.message || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Notion request failed:', error);
    
    // Handle specific errors
    if (error.name === 'AbortError') {
      toast.error('Requête Notion expirée', {
        description: 'La connexion à Notion a pris trop de temps',
      });
      throw new Error('Notion request timeout');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      toast.error('Erreur de connexion à Notion', {
        description: 'Vérifiez votre connexion internet et les paramètres de Notion',
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
      return await notionApiRequest('/users/me', {}, apiKey);
    }
  },
  
  // Database endpoints
  databases: {
    query: async (databaseId: string, params: any = {}, apiKey?: string) => {
      return await notionApiRequest(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: JSON.stringify(params)
      }, apiKey);
    }
  },
  
  // Page endpoints
  pages: {
    retrieve: async (pageId: string, apiKey?: string) => {
      return await notionApiRequest(`/pages/${pageId}`, {}, apiKey);
    },
    
    create: async (params: any, apiKey?: string) => {
      return await notionApiRequest('/pages', {
        method: 'POST',
        body: JSON.stringify(params)
      }, apiKey);
    },
    
    update: async (pageId: string, params: any, apiKey?: string) => {
      return await notionApiRequest(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(params)
      }, apiKey);
    }
  }
};
