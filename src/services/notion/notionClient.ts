
/**
 * Client standardisé pour l'API Notion
 * 
 * Ce module fournit une interface simplifiée pour interagir avec l'API Notion,
 * gérant à la fois le mode réel et le mode mock.
 */

import { NotionConfig, NotionResponse } from './types';

/**
 * Options pour une requête à l'API Notion
 */
export interface NotionQueryOptions {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Interface minimale pour le client Notion
 */
export interface NotionClient {
  /**
   * Configure le client Notion
   */
  configure(config: NotionConfig): void;
  
  /**
   * Vérifie si le client est correctement configuré
   */
  isConfigured(): boolean;
  
  /**
   * Vérifie si le mode mock est activé
   */
  isMockMode(): boolean;
  
  /**
   * Active ou désactive explicitement le mode mock
   */
  setMockMode(enabled: boolean): void;
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig | undefined;
  
  /**
   * Effectue une requête à l'API Notion
   */
  query(options: NotionQueryOptions): Promise<NotionResponse<any>>;
  
  /**
   * Effectue une requête GET vers l'API Notion
   */
  get<T>(endpoint: string): Promise<NotionResponse<T>>;
  
  /**
   * Effectue une requête POST vers l'API Notion
   */
  post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>>;
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   */
  patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>>;
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   */
  delete<T>(endpoint: string): Promise<NotionResponse<T>>;
  
  /**
   * Effectue une requête générique vers l'API Notion
   */
  request<T>(method: string, endpoint: string, data?: any): Promise<NotionResponse<T>>;
}

/**
 * Client pour l'API Notion
 */
class NotionClientImpl implements NotionClient {
  private config?: NotionConfig;
  private mockMode: boolean = false;
  
  /**
   * Configure le client Notion
   */
  configure(config: NotionConfig): void {
    this.config = config;
    this.mockMode = config.mockMode || false;
  }
  
  /**
   * Vérifie si le client est correctement configuré
   */
  isConfigured(): boolean {
    return !!this.config && !!this.config.apiKey;
  }
  
  /**
   * Vérifie si le mode mock est activé
   */
  isMockMode(): boolean {
    return this.mockMode || !this.config || !this.config.apiKey;
  }
  
  /**
   * Active ou désactive explicitement le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig | undefined {
    return this.config;
  }
  
  /**
   * Effectue une requête à l'API Notion
   */
  async query(options: NotionQueryOptions): Promise<NotionResponse<any>> {
    try {
      if (!this.config) {
        return { success: false, error: { message: 'Configuration Notion non disponible' } };
      }
      
      if (this.isMockMode()) {
        console.log('[Notion Mock]', options.method, options.path);
        return { success: false, error: { message: 'Mode mock activé, utilisez les méthodes de mock dédiées' } };
      }
      
      // Préparer les headers
      const headers = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      // Construire l'URL
      const baseUrl = 'https://api.notion.com/v1';
      const url = `${baseUrl}${options.path}`;
      
      // Exécuter la requête
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      // Traiter la réponse
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || `Erreur API Notion: ${response.status}`,
            status: response.status,
            code: data.code,
            details: data
          }
        };
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          details: error
        }
      };
    }
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.query({
      method: 'GET',
      path: endpoint
    });
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   */
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.query({
      method: 'POST',
      path: endpoint,
      body: data
    });
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   */
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.query({
      method: 'PATCH',
      path: endpoint,
      body: data
    });
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.query({
      method: 'DELETE',
      path: endpoint
    });
  }
  
  /**
   * Effectue une requête générique vers l'API Notion
   */
  async request<T>(method: string, endpoint: string, data?: any): Promise<NotionResponse<T>> {
    switch (method.toUpperCase()) {
      case 'GET':
        return this.get<T>(endpoint);
      case 'POST':
        return this.post<T>(endpoint, data);
      case 'PATCH':
        return this.patch<T>(endpoint, data);
      case 'DELETE':
        return this.delete<T>(endpoint);
      default:
        return {
          success: false,
          error: {
            message: `Méthode HTTP non supportée: ${method}`
          }
        };
    }
  }
}

// Créer et exporter une instance singleton
export const notionClient: NotionClient = new NotionClientImpl();

// Export par défaut
export default notionClient;
