
/**
 * Client HTTP de bas niveau pour l'API Notion
 * 
 * Responsable uniquement des requêtes HTTP vers l'API Notion.
 * Ne contient pas de logique métier, seulement la communication HTTP.
 */

import { NotionConfig, NotionResponse, NotionError } from '../types';

/**
 * Client HTTP pour l'API Notion
 * 
 * Gère les communications HTTP avec l'API Notion, sans aucune 
 * logique de mode opérationnel ou de transformation de données.
 */
export class NotionHttpClient {
  private config: NotionConfig = {
    mockMode: false,
    debug: false
  };
  
  /**
   * Configure le client Notion
   * @param config Configuration du client
   */
  configure(config: NotionConfig): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.request<T>('GET', endpoint);
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
  
  /**
   * Effectue une requête HTTP vers l'API Notion
   * @param method Méthode HTTP (GET, POST, etc.)
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer (optionnel)
   * @returns Promise avec le résultat de la requête
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<NotionResponse<T>> {
    // Vérifier que le client est configuré
    if (!this.config.apiKey) {
      return {
        success: false,
        error: {
          message: 'Clé API Notion non configurée'
        }
      };
    }
    
    try {
      // Construire l'URL de l'API
      const baseUrl = 'https://api.notion.com/v1';
      const url = `${baseUrl}${endpoint}`;
      
      // Construire les headers de la requête
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };
      
      // Construire les options de la requête
      const options: RequestInit = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
      };
      
      // En mode debug, afficher les informations de la requête
      if (this.config.debug) {
        console.log(`[Notion API] ${method} ${endpoint}`);
        if (data) console.log('[Notion API] Body:', data);
      }
      
      // Effectuer la requête
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      // Si la requête a échoué, retourner une erreur
      if (!response.ok) {
        const error: NotionError = {
          message: responseData.message || 'Erreur lors de la requête Notion',
          code: responseData.code,
          status: response.status,
          details: responseData
        };
        
        // En mode debug, afficher l'erreur
        if (this.config.debug) {
          console.error('[Notion API] Error:', error);
        }
        
        return {
          success: false,
          error
        };
      }
      
      // En mode debug, afficher les données de la réponse
      if (this.config.debug) {
        console.log('[Notion API] Response:', responseData);
      }
      
      // Retourner les données de la réponse
      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      // En mode debug, afficher l'erreur
      if (this.config.debug) {
        console.error('[Notion API] Exception:', error);
      }
      
      // Retourner une erreur
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue lors de la requête Notion'
        }
      };
    }
  }
}

// Exporter une instance singleton
export const notionHttpClient = new NotionHttpClient();

// Export par défaut
export default notionHttpClient;
