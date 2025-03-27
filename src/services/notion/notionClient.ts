
/**
 * Client Notion unifié
 * 
 * Ce module fournit un client unifié pour l'API Notion qui délègue
 * les requêtes réelles au client HTTP ou au client mock selon le mode.
 */

import { notionClient as notionUnifiedClient } from './client/notionClient';
import { NotionConfig, ConnectionTestResult, NotionResponse } from './types';

/**
 * Façade pour le client Notion unifié
 * 
 * Cette classe est conservée pour la compatibilité avec le code existant.
 * Elle délègue toutes les opérations au client unifié implémenté dans client/notionClient.ts.
 * 
 * @deprecated Utilisez directement l'import depuis './client/notionClient'
 */
class NotionClient {
  // Déléguer les méthodes de configuration
  configure = notionUnifiedClient.configure.bind(notionUnifiedClient);
  isConfigured = notionUnifiedClient.isConfigured.bind(notionUnifiedClient);
  getConfig = notionUnifiedClient.getConfig.bind(notionUnifiedClient);
  
  // Déléguer les méthodes de gestion du mode
  setMockMode = notionUnifiedClient.setMockMode.bind(notionUnifiedClient);
  isMockMode = notionUnifiedClient.isMockMode.bind(notionUnifiedClient);
  setDebugMode = notionUnifiedClient.setDebugMode?.bind(notionUnifiedClient) || 
    ((enabled: boolean) => { 
      const config = this.getConfig();
      this.configure({ ...config, debug: enabled });
    });
  
  // Déléguer les méthodes de requête
  get = notionUnifiedClient.get.bind(notionUnifiedClient);
  post = notionUnifiedClient.post.bind(notionUnifiedClient);
  patch = notionUnifiedClient.patch.bind(notionUnifiedClient);
  delete = notionUnifiedClient.delete.bind(notionUnifiedClient);
  
  // Déléguer la méthode de test de connexion
  testConnection = notionUnifiedClient.testConnection.bind(notionUnifiedClient);
  
  /**
   * Effectue une requête vers l'API Notion
   * 
   * @deprecated Utilisez plutôt les méthodes spécifiques (get, post, etc.)
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

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
