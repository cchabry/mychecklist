
/**
 * Client Notion qui utilise l'abstraction de proxy API
 */

import { 
  apiProxy, 
  ApiResponse, 
  RequestOptions,
  ProxyManager
} from '@/services/apiProxy';

import {
  NotionClientConfig,
  NotionUser,
  NotionDatabase,
  NotionPage,
  NotionBlock,
  NotionListResponse,
  DatabaseQueryParams,
  SearchParams
} from './types';

export class NotionClient {
  private readonly apiVersion: string;
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly proxyManager: ProxyManager;
  private readonly debug: boolean;

  constructor(config: NotionClientConfig = {}) {
    this.apiVersion = config.apiVersion || '2022-06-28';
    this.baseUrl = config.baseUrl || '/v1';
    this.defaultHeaders = {
      'Notion-Version': this.apiVersion,
      'Content-Type': 'application/json',
      ...config.defaultHeaders
    };
    this.proxyManager = apiProxy;
    this.debug = config.debug || false;
  }

  /**
   * Obtient le jeton d'autorisation, soit depuis les options, soit depuis le stockage local
   */
  private getAuthToken(options?: RequestOptions): string | null {
    // Chercher dans les headers des options
    const authHeader = options?.headers?.['Authorization'] || options?.headers?.['authorization'];
    if (authHeader) return authHeader;

    // Chercher dans localStorage
    const storedToken = localStorage.getItem('notion_api_key');
    if (storedToken) {
      // Formater correctement le token
      return storedToken.startsWith('Bearer ') 
        ? storedToken 
        : `Bearer ${storedToken}`;
    }

    return null;
  }

  /**
   * Prépare les options de requête en ajoutant l'authentification et les headers par défaut
   */
  private prepareOptions(options: RequestOptions = {}): RequestOptions {
    const token = this.getAuthToken(options);
    
    return {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token ? { 'Authorization': token } : {}),
        ...options.headers
      }
    };
  }

  /**
   * Normalise un endpoint pour garantir la cohérence
   */
  private normalizeEndpoint(endpoint: string): string {
    // Assurer que l'endpoint commence par /
    let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Ajouter le préfixe /v1 si absent
    if (!normalizedEndpoint.startsWith(this.baseUrl)) {
      normalizedEndpoint = `${this.baseUrl}${normalizedEndpoint}`;
    }
    
    return normalizedEndpoint;
  }

  /**
   * Journalise les opérations si le mode debug est activé
   */
  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[NotionClient]', ...args);
    }
  }

  /**
   * Méthode générique pour effectuer des requêtes à l'API Notion
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const preparedOptions = this.prepareOptions(options);
    
    this.log(`${method} ${normalizedEndpoint}`, data || '');
    
    try {
      const response = await this.proxyManager.request<T>(
        method,
        normalizedEndpoint,
        data,
        preparedOptions
      );
      
      return response;
    } catch (error) {
      this.log('Request error:', error);
      throw error;
    }
  }

  // Méthodes raccourcies pour les opérations HTTP standard
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // API Utilisateurs
  
  /**
   * Récupère les informations de l'utilisateur actuel
   */
  async getCurrentUser(options: RequestOptions = {}): Promise<ApiResponse<NotionUser>> {
    return this.get<NotionUser>('/users/me', options);
  }

  /**
   * Liste tous les utilisateurs
   */
  async listUsers(options: RequestOptions = {}): Promise<ApiResponse<NotionListResponse<NotionUser>>> {
    return this.get<NotionListResponse<NotionUser>>('/users', options);
  }

  // API Bases de données
  
  /**
   * Récupère les détails d'une base de données
   */
  async getDatabase(databaseId: string, options: RequestOptions = {}): Promise<ApiResponse<NotionDatabase>> {
    return this.get<NotionDatabase>(`/databases/${databaseId}`, options);
  }

  /**
   * Interroge une base de données
   */
  async queryDatabase(
    databaseId: string, 
    params: DatabaseQueryParams = {}, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionListResponse<NotionPage>>> {
    return this.post<NotionListResponse<NotionPage>>(
      `/databases/${databaseId}/query`, 
      params,
      options
    );
  }

  /**
   * Crée une nouvelle base de données
   */
  async createDatabase(
    data: { 
      parent: { page_id: string } | { database_id: string }; 
      title: any[]; 
      properties: Record<string, any>; 
    },
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionDatabase>> {
    return this.post<NotionDatabase>('/databases', data, options);
  }

  // API Pages
  
  /**
   * Récupère les détails d'une page
   */
  async getPage(pageId: string, options: RequestOptions = {}): Promise<ApiResponse<NotionPage>> {
    return this.get<NotionPage>(`/pages/${pageId}`, options);
  }

  /**
   * Crée une nouvelle page
   */
  async createPage(
    data: { 
      parent: { database_id: string } | { page_id: string }; 
      properties: Record<string, any>;
      children?: any[];
    },
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionPage>> {
    return this.post<NotionPage>('/pages', data, options);
  }

  /**
   * Met à jour une page existante
   */
  async updatePage(
    pageId: string,
    data: { 
      properties?: Record<string, any>;
      archived?: boolean;
    },
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionPage>> {
    return this.patch<NotionPage>(`/pages/${pageId}`, data, options);
  }

  // API Blocs
  
  /**
   * Récupère les enfants d'un bloc
   */
  async getBlockChildren(
    blockId: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionListResponse<NotionBlock>>> {
    return this.get<NotionListResponse<NotionBlock>>(`/blocks/${blockId}/children`, options);
  }

  /**
   * Ajoute des blocs enfants à un bloc ou une page
   */
  async appendBlockChildren(
    blockId: string,
    children: any[],
    options: RequestOptions = {}
  ): Promise<ApiResponse<{ results: NotionBlock[] }>> {
    return this.patch<{ results: NotionBlock[] }>(
      `/blocks/${blockId}/children`,
      { children },
      options
    );
  }

  /**
   * Récupère un bloc spécifique
   */
  async getBlock(blockId: string, options: RequestOptions = {}): Promise<ApiResponse<NotionBlock>> {
    return this.get<NotionBlock>(`/blocks/${blockId}`, options);
  }

  /**
   * Met à jour un bloc
   */
  async updateBlock(
    blockId: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionBlock>> {
    return this.patch<NotionBlock>(`/blocks/${blockId}`, data, options);
  }

  /**
   * Supprime un bloc (archivage)
   */
  async deleteBlock(blockId: string, options: RequestOptions = {}): Promise<ApiResponse<NotionBlock>> {
    return this.patch<NotionBlock>(`/blocks/${blockId}`, { archived: true }, options);
  }

  // API Recherche
  
  /**
   * Recherche dans Notion
   */
  async search(
    params: SearchParams = {},
    options: RequestOptions = {}
  ): Promise<ApiResponse<NotionListResponse<NotionPage | NotionDatabase>>> {
    return this.post<NotionListResponse<NotionPage | NotionDatabase>>(
      '/search',
      params,
      options
    );
  }

  // Méthodes utilitaires
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(options: RequestOptions = {}): Promise<{ 
    success: boolean; 
    user?: string; 
    error?: string; 
    details?: any 
  }> {
    try {
      const response = await this.getCurrentUser(options);
      
      if (response.success && response.data) {
        return {
          success: true,
          user: response.data.name || response.data.id
        };
      }
      
      return {
        success: false,
        error: response.error?.message || 'Réponse invalide',
        details: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        details: error
      };
    }
  }

  /**
   * Vérifie si le client dispose d'une configuration valide
   */
  isConfigured(): boolean {
    return !!this.getAuthToken();
  }
}

// Export d'une instance par défaut du client
const defaultClient = new NotionClient();
export default defaultClient;
