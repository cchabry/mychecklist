
/**
 * Client Notion unifié
 * 
 * Ce module fournit un client unifié pour l'API Notion qui délègue
 * les requêtes réelles au client HTTP ou au client mock selon le mode.
 */

import { notionClient as notionUnifiedClient } from './client/notionClient';
import type { NotionResponse } from './types';

/**
 * Façade pour le client Notion unifié
 * 
 * Cette classe délègue toutes les opérations au client unifié.
 */
class NotionClient {
  /**
   * Configure le client Notion
   * @param config Configuration du client
   */
  configure(config: any) {
    return notionUnifiedClient.configure(config);
  }
  
  /**
   * Vérifie si le client est correctement configuré pour fonctionner
   * @returns true si la configuration minimale est présente
   */
  isConfigured() {
    return notionUnifiedClient.isConfigured();
  }
  
  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig = notionUnifiedClient.getConfig.bind(notionUnifiedClient);
  
  /**
   * Active ou désactive le mode mock
   * @param enabled État souhaité du mode mock
   */
  setMockMode(enabled: boolean) {
    return notionUnifiedClient.setMockMode(enabled);
  }
  
  /**
   * Vérifie si le mode mock est actif
   * @returns true si le client est en mode mock/démo
   */
  isMockMode = notionUnifiedClient.isMockMode.bind(notionUnifiedClient);
  
  /**
   * Active ou désactive le mode debug
   * @param enabled État souhaité du mode debug
   */
  setDebugMode(enabled: boolean) {
    return notionUnifiedClient.setDebugMode(enabled);
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return notionUnifiedClient.get<T>(endpoint);
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  post<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    return notionUnifiedClient.post<T>(endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  patch<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    return notionUnifiedClient.patch<T>(endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return notionUnifiedClient.delete<T>(endpoint);
  }
  
  /**
   * Teste la connexion à l'API Notion
   * @returns Résultat du test de connexion
   */
  testConnection() {
    return notionUnifiedClient.testConnection();
  }
  
  /**
   * Effectue une requête vers l'API Notion
   * 
   * @param method Méthode HTTP (GET, POST, etc.)
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer (optionnel)
   * @returns Promise avec le résultat de la requête
   * @deprecated Utilisez plutôt les méthodes spécifiques (get, post, etc.)
   */
  async request<T>(method: string, endpoint: string, data?: unknown): Promise<NotionResponse<T>> {
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

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
