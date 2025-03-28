
/**
 * Client Notion unifié
 * 
 * Ce module fournit un client unifié pour l'API Notion qui délègue
 * les requêtes réelles au client HTTP ou au client mock selon le mode.
 */

import { notionHttpClient } from './notionHttpClient';
import { notionMockClient } from './mock/notionMockClient';
import { operationModeService } from '@/services/operationMode';
import { NotionResponse } from '../types';
import { NotionConfig } from '../base/types';

/**
 * Client Notion unifié
 * 
 * Cette classe délègue les opérations aux clients sous-jacents
 * en fonction du mode d'opération (réel ou mock).
 */
class NotionClient {
  private config: NotionConfig | null = null;
  private forceMockMode: boolean = false;
  private debugMode: boolean = false;

  /**
   * Configure le client Notion
   * @param config Configuration du client
   */
  configure(config: NotionConfig): void {
    this.config = { ...config };
    
    // Configurer le client HTTP uniquement si on est en mode réel
    if (this.isRealMode()) {
      notionHttpClient.configure(config);
    }
  }

  /**
   * Vérifie si le client est correctement configuré pour fonctionner
   * @returns true si la configuration minimale est présente
   */
  isConfigured(): boolean {
    return !!this.config && !!this.config.apiKey && !!this.config.projectsDbId;
  }

  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig(): NotionConfig | null {
    return this.config ? { ...this.config } : null;
  }

  /**
   * Active ou désactive le mode mock
   * @param enabled État souhaité du mode mock
   */
  setMockMode(enabled: boolean): void {
    this.forceMockMode = enabled;
  }

  /**
   * Active ou désactive le mode debug
   * @param enabled État souhaité du mode debug
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Vérifie si le mode mock est actif
   * @returns true si le client est en mode mock/démo
   */
  isMockMode(): boolean {
    // Mode mock forcé ou mode démo global
    return this.forceMockMode || operationModeService.isDemoMode();
  }

  /**
   * Vérifie si le mode réel est actif
   * @returns true si le client est en mode réel
   */
  isRealMode(): boolean {
    // Mode réel si on n'est pas en mode mock et qu'on est en mode réel global
    return !this.isMockMode() && operationModeService.isRealMode();
  }

  /**
   * Effectue une requête GET vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    if (this.debugMode) {
      console.log(`[Notion] GET ${endpoint}`);
    }
    
    return this.isMockMode()
      ? notionMockClient.get<T>(endpoint)
      : notionHttpClient.get<T>(endpoint);
  }

  /**
   * Effectue une requête POST vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  async post<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    if (this.debugMode) {
      console.log(`[Notion] POST ${endpoint}`, data);
    }
    
    return this.isMockMode()
      ? notionMockClient.post<T>(endpoint, data)
      : notionHttpClient.post<T>(endpoint, data);
  }

  /**
   * Effectue une requête PATCH vers l'API Notion
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat de la requête
   */
  async patch<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    if (this.debugMode) {
      console.log(`[Notion] PATCH ${endpoint}`, data);
    }
    
    return this.isMockMode()
      ? notionMockClient.patch<T>(endpoint, data)
      : notionHttpClient.patch<T>(endpoint, data);
  }

  /**
   * Effectue une requête DELETE vers l'API Notion
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat de la requête
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    if (this.debugMode) {
      console.log(`[Notion] DELETE ${endpoint}`);
    }
    
    return this.isMockMode()
      ? notionMockClient.delete<T>(endpoint)
      : notionHttpClient.delete<T>(endpoint);
  }

  /**
   * Teste la connexion à l'API Notion
   * @returns Résultat du test de connexion
   */
  async testConnection(): Promise<{
    success: boolean;
    user?: string;
    workspaceName?: string;
    error?: string;
  }> {
    try {
      if (this.isMockMode()) {
        return await notionMockClient.testConnection();
      }
      
      const response = await notionHttpClient.get('/users/me');
      
      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Unknown error'
        };
      }
      
      const user = response.data;
      return {
        success: true,
        user: user.name,
        workspaceName: user.workspace_name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
