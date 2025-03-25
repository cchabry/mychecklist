
import { 
  apiProxy, 
  ApiResponse, 
  RequestOptions 
} from '../apiProxy';
import { notionApiRequest } from '@/lib/notionProxy/proxyFetch';

/**
 * Client API Notion utilisant le nouveau système de proxy modulaire
 * Cette interface abstraite la communication avec l'API Notion
 * et utilise le système de proxy pour gérer les détails spécifiques à la plateforme
 */
export class NotionApiClient {
  /**
   * Endpoint de base pour l'API Notion
   */
  private readonly baseEndpoint: string = '/v1';
  
  /**
   * Options par défaut pour les requêtes
   */
  private readonly defaultOptions: RequestOptions = {
    cache: true,
    retries: 1
  };
  
  /**
   * Effectue une requête à l'API Notion en utilisant exclusivement la fonction Netlify
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    // Normaliser l'endpoint
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    
    try {
      // Utiliser notionApiRequest qui passe par la fonction Netlify
      const response = await notionApiRequest(normalizedEndpoint, method, data);
      
      return {
        success: true,
        data: response as T
      };
    } catch (error) {
      console.error(`Erreur lors de la requête ${method} vers ${normalizedEndpoint}:`, error);
      
      return {
        success: false,
        error: {
          status: error.status || 500,
          message: error.message || 'Erreur lors de la requête à l\'API Notion',
          details: error
        }
      };
    }
  }
  
  /**
   * Effectue une requête GET à l'API Notion
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  /**
   * Effectue une requête POST à l'API Notion
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }
  
  /**
   * Effectue une requête PATCH à l'API Notion
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
  
  /**
   * Effectue une requête DELETE à l'API Notion
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }
  
  /**
   * Normalise un endpoint pour garantir le format correct
   */
  private normalizeEndpoint(endpoint: string): string {
    // Si l'endpoint commence déjà par la base, ne pas l'ajouter
    if (endpoint.startsWith(this.baseEndpoint)) {
      return endpoint;
    }
    
    // Ajouter le slash de début si nécessaire
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Ajouter la base
    return `${this.baseEndpoint}${formattedEndpoint}`;
  }
  
  // API Notion - Utilisateurs
  
  /**
   * Récupère l'utilisateur actuel
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.get('/users/me');
  }
  
  /**
   * Liste tous les utilisateurs
   */
  async listUsers(): Promise<ApiResponse<any>> {
    return this.get('/users');
  }
  
  // API Notion - Bases de données
  
  /**
   * Récupère une base de données par son ID
   */
  async getDatabase(databaseId: string): Promise<ApiResponse<any>> {
    return this.get(`/databases/${databaseId}`);
  }
  
  /**
   * Interroge une base de données
   */
  async queryDatabase(databaseId: string, query?: any): Promise<ApiResponse<any>> {
    return this.post(`/databases/${databaseId}/query`, query);
  }
  
  // API Notion - Pages
  
  /**
   * Récupère une page par son ID
   */
  async getPage(pageId: string): Promise<ApiResponse<any>> {
    return this.get(`/pages/${pageId}`);
  }
  
  /**
   * Crée une nouvelle page
   */
  async createPage(data: any): Promise<ApiResponse<any>> {
    return this.post('/pages', data);
  }
  
  /**
   * Met à jour une page
   */
  async updatePage(pageId: string, data: any): Promise<ApiResponse<any>> {
    return this.patch(`/pages/${pageId}`, data);
  }
  
  // API Notion - Blocs
  
  /**
   * Récupère les blocs enfants d'un bloc ou d'une page
   */
  async getBlockChildren(blockId: string): Promise<ApiResponse<any>> {
    return this.get(`/blocks/${blockId}/children`);
  }
  
  /**
   * Ajoute des blocs enfants à un bloc ou une page
   */
  async appendBlockChildren(blockId: string, children: any[]): Promise<ApiResponse<any>> {
    return this.patch(`/blocks/${blockId}/children`, {
      children
    });
  }
}

// Exporter une instance singleton du client
export const notionClient = new NotionApiClient();

// Exporter par défaut
export default notionClient;
