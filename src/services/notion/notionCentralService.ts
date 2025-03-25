
/**
 * Service central pour toutes les interactions avec l'API Notion
 * Ce service est le SEUL autorisé à effectuer des appels directs à l'API Notion
 */

import { toast } from 'sonner';

// URL de base pour les fonctions Netlify
const NETLIFY_FUNCTION_URL = '/.netlify/functions/notion-proxy';

// Types pour les méthodes HTTP supportées
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Configuration pour les requêtes
export interface RequestConfig {
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  token?: string;
}

// Type générique pour les réponses
export interface ResponseData<T = any> {
  data: T;
  status: number;
}

/**
 * Service central qui fournit des méthodes d'accès bas niveau à l'API Notion
 * Toute la communication avec l'API Notion DOIT passer par ce service
 */
export const notionCentralService = {
  /**
   * Méthode fondamentale pour toutes les requêtes à l'API Notion
   * Utilise EXCLUSIVEMENT la fonction Netlify pour contourner CORS
   */
  async request<T = any>({ endpoint, method = 'GET', body, token }: RequestConfig): Promise<T> {
    // Récupérer le token depuis localStorage si non fourni
    const authToken = token || localStorage.getItem('notion_api_key');
    
    if (!authToken) {
      throw new Error('Clé API Notion manquante');
    }
    
    console.log(`📡 notionCentralService: ${method} ${endpoint}`);
    
    try {
      // Appeler la fonction Netlify
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          method,
          body,
          token: authToken
        })
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`❌ Erreur API Notion: ${response.status}`, responseText);
        throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
      }
      
      // Traiter la réponse JSON
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('❌ Erreur lors de la requête à l\'API Notion:', error);
      throw error;
    }
  },
  
  /**
   * Test la connexion à l'API Notion
   */
  async testConnection(token?: string): Promise<{ success: boolean; user?: string; error?: string }> {
    try {
      const data = await this.request<any>({
        endpoint: '/users/me',
        token
      });
      
      return {
        success: true,
        user: data.name || data.id || 'Utilisateur Notion'
      };
    } catch (error) {
      console.error('❌ Erreur lors du test de connexion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  /**
   * API pour les opérations sur les utilisateurs
   */
  users: {
    /**
     * Récupère l'utilisateur actuel
     */
    me: async (token?: string) => {
      return notionCentralService.request<any>({
        endpoint: '/users/me',
        token
      });
    },
    
    /**
     * Liste tous les utilisateurs
     */
    list: async (token?: string) => {
      return notionCentralService.request<any>({
        endpoint: '/users',
        token
      });
    }
  },
  
  /**
   * API pour les opérations sur les bases de données
   */
  databases: {
    /**
     * Récupère les informations d'une base de données
     */
    retrieve: async (databaseId: string, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: `/databases/${databaseId}`,
        token
      });
    },
    
    /**
     * Exécute une requête sur une base de données
     */
    query: async (databaseId: string, queryParams: any, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: `/databases/${databaseId}/query`,
        method: 'POST',
        body: queryParams,
        token
      });
    }
  },
  
  /**
   * API pour les opérations sur les pages
   */
  pages: {
    /**
     * Récupère une page par son ID
     */
    retrieve: async (pageId: string, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: `/pages/${pageId}`,
        token
      });
    },
    
    /**
     * Crée une nouvelle page
     */
    create: async (data: any, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: '/pages',
        method: 'POST',
        body: data,
        token
      });
    },
    
    /**
     * Met à jour une page existante
     */
    update: async (pageId: string, data: any, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: `/pages/${pageId}`,
        method: 'PATCH',
        body: data,
        token
      });
    }
  },
  
  /**
   * API pour les opérations de recherche
   */
  search: {
    /**
     * Effectue une recherche dans l'espace de travail Notion
     */
    query: async (params: any, token?: string) => {
      return notionCentralService.request<any>({
        endpoint: '/search',
        method: 'POST',
        body: params,
        token
      });
    }
  },
  
  /**
   * Mode démo - pour compatibilité avec l'ancienne interface
   */
  mockMode: {
    isActive: () => false,
    enable: () => console.warn('Mode démo déprécié, utiliser operationMode'),
    disable: () => console.warn('Mode démo déprécié, utiliser operationMode'),
    reset: () => console.warn('Mode démo déprécié, utiliser operationMode'),
    forceReset: () => console.warn('Mode démo déprécié, utiliser operationMode')
  }
};

export default notionCentralService;
