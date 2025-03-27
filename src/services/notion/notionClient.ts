
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
 * Cette classe est conservée pour la compatibilité avec le code existant.
 * Elle délègue toutes les opérations au client unifié implémenté dans client/notionClient.ts.
 */
class NotionClient {
  /**
   * Configure le client Notion
   * @param config Configuration du client
   */
  configure = notionUnifiedClient.configure.bind(notionUnifiedClient);
  
  /**
   * Vérifie si le client est correctement configuré pour fonctionner
   * @returns true si la configuration minimale est présente
   */
  isConfigured = notionUnifiedClient.isConfigured.bind(notionUnifiedClient);
  
  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig = notionUnifiedClient.getConfig.bind(notionUnifiedClient);
  
  /**
   * Active ou désactive le mode mock
   * @param enabled État souhaité du mode mock
   */
  setMockMode = notionUnifiedClient.setMockMode.bind(notionUnifiedClient);
  
  /**
   * Vérifie si le mode mock est actif
   * @returns true si le client est en mode mock/démo
   */
  isMockMode = notionUnifiedClient.isMockMode.bind(notionUnifiedClient);
  
  /**
   * Active ou désactive le mode debug
   * @param enabled État souhaité du mode debug
   */
  setDebugMode = notionUnifiedClient.setDebugMode.bind(notionUnifiedClient);
  
  /**
   * Effectue une requête GET vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  get = notionUnifiedClient.get.bind(notionUnifiedClient);
  
  /**
   * Effectue une requête POST vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  post = notionUnifiedClient.post.bind(notionUnifiedClient);
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  patch = notionUnifiedClient.patch.bind(notionUnifiedClient);
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  delete = notionUnifiedClient.delete.bind(notionUnifiedClient);
  
  /**
   * Teste la connexion à l'API Notion
   * @returns Résultat du test de connexion
   */
  testConnection = notionUnifiedClient.testConnection.bind(notionUnifiedClient);
  
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
