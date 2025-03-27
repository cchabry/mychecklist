
/**
 * Client Notion API unifié
 * 
 * Ce module fournit un client unifié pour l'API Notion qui gère:
 * 1. Le mode réel (requêtes vers l'API Notion)
 * 2. Le mode démo (données simulées)
 * 
 * Il sert de façade pour notionHttpClient et notionMockClient.
 */

import { notionHttpClient } from './notionHttpClient';
import { notionMockClient } from './notionMockClient';
import { NotionConfig, NotionResponse, ConnectionTestResult } from '../types';
import { useOperationMode } from '@/hooks/useOperationMode';

/**
 * Client API Notion
 */
export class NotionClient {
  private config: NotionConfig = {
    mockMode: false,
    debug: false
  };
  
  /**
   * Configure le client Notion
   */
  configure(config: NotionConfig): void {
    this.config = { ...this.config, ...config };
    
    // Transmettre la configuration au client HTTP
    if (!this.config.mockMode) {
      notionHttpClient.configure(config);
    }
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.config.projectsDbId;
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Active ou désactive le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.config.mockMode = enabled;
  }
  
  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return !!this.config.mockMode || useOperationMode().isDemoMode;
  }
  
  /**
   * Active ou désactive le mode debug
   */
  setDebugMode(enabled: boolean): void {
    this.config.debug = enabled;
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.isMockMode()
      ? notionMockClient.get<T>(endpoint)
      : notionHttpClient.get<T>(endpoint);
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   */
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.isMockMode()
      ? notionMockClient.post<T>(endpoint, data)
      : notionHttpClient.post<T>(endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   */
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.isMockMode()
      ? notionMockClient.patch<T>(endpoint, data)
      : notionHttpClient.patch<T>(endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.isMockMode()
      ? notionMockClient.delete<T>(endpoint)
      : notionHttpClient.delete<T>(endpoint);
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    // En mode mock, utiliser le mock client
    if (this.isMockMode()) {
      return notionMockClient.testConnection();
    }
    
    // Vérifier que le client est configuré
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Clé API Notion non configurée'
      };
    }
    
    try {
      // Tester l'API Notion en récupérant l'utilisateur
      const userResponse = await this.get<any>('/users/me');
      
      if (!userResponse.success) {
        return {
          success: false,
          error: userResponse.error?.message || 'Erreur lors de la connexion à Notion'
        };
      }
      
      // Tester l'accès à la base de données des projets
      let projectsDbName = '';
      if (this.config.projectsDbId) {
        const projectsDbResponse = await this.get<any>(`/databases/${this.config.projectsDbId}`);
        
        if (projectsDbResponse.success) {
          projectsDbName = projectsDbResponse.data?.title?.[0]?.plain_text || this.config.projectsDbId;
        } else {
          return {
            success: false,
            error: `Impossible d'accéder à la base de données des projets: ${projectsDbResponse.error?.message}`
          };
        }
      } else {
        return {
          success: false,
          error: 'ID de la base de données des projets non configuré'
        };
      }
      
      // Tester l'accès à la base de données des checklists si configurée
      let checklistsDbName = '';
      if (this.config.checklistsDbId) {
        const checklistsDbResponse = await this.get<any>(`/databases/${this.config.checklistsDbId}`);
        
        if (checklistsDbResponse.success) {
          checklistsDbName = checklistsDbResponse.data?.title?.[0]?.plain_text || this.config.checklistsDbId;
        }
      }
      
      // Retourner le résultat du test
      return {
        success: true,
        user: userResponse.data?.name || userResponse.data?.id,
        workspaceName: userResponse.data?.workspace_name || 'Workspace inconnu',
        projectsDbName,
        checklistsDbName: checklistsDbName || undefined
      };
    } catch (error) {
      // Retourner une erreur
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du test de connexion'
      };
    }
  }
}

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
