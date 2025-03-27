
/**
 * Client Mock pour l'API Notion
 * 
 * Fournit une implémentation simulée du client Notion pour le mode démo.
 * Ce client ne fait pas de vraies requêtes HTTP mais retourne des données simulées.
 */

import { NotionResponse, ConnectionTestResult } from '../types';
import { delay } from '@/utils';

/**
 * Client Mock pour l'API Notion
 */
export class NotionMockClient {
  /**
   * Simule une requête GET vers l'API Notion
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.simulateRequest<T>();
  }
  
  /**
   * Simule une requête POST vers l'API Notion
   */
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.simulateRequest<T>();
  }
  
  /**
   * Simule une requête PATCH vers l'API Notion
   */
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.simulateRequest<T>();
  }
  
  /**
   * Simule une requête DELETE vers l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.simulateRequest<T>();
  }
  
  /**
   * Simule un test de connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    await delay(500);
    
    return {
      success: true,
      user: 'Utilisateur démo',
      workspaceName: 'Workspace démo',
      projectsDbName: 'Projets (démo)',
      checklistsDbName: 'Checklists (démo)'
    };
  }
  
  /**
   * Simule une requête HTTP vers l'API Notion
   */
  private async simulateRequest<T>(): Promise<NotionResponse<T>> {
    // Attendre pour simuler une latence réseau
    await delay(500);
    
    // Retourner une réponse simulée
    return {
      success: true,
      data: {} as T
    };
  }
}

// Exporter une instance singleton
export const notionMockClient = new NotionMockClient();

// Export par défaut
export default notionMockClient;
