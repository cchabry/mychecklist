
/**
 * Client de base pour l'API Notion
 * 
 * Ce module fournit un client HTTP de base pour interagir avec l'API Notion,
 * avec support du mode de démonstration pour le développement sans API réelle.
 */

import { NotionConfig } from '../types/NotionConfig';
import { NotionResponse } from '../types/ResponseTypes';

/**
 * Configuration par défaut pour le client Notion en mode démonstration
 */
const DEFAULT_MOCK_CONFIG: NotionConfig = {
  apiKey: 'demo-api-key',
  mode: 'demo',
  projectsDbId: 'demo-projects-db',
  auditsDbId: 'demo-audits-db',
  exigencesDbId: 'demo-exigences-db',
  pagesDbId: 'demo-pages-db',
  evaluationsDbId: 'demo-evaluations-db',
  checklistDbId: 'demo-checklist-db',
  actionsDbId: 'demo-actions-db',
  progressDbId: 'demo-progress-db'
};

/**
 * Client pour l'API Notion
 */
class NotionClient {
  private config: NotionConfig;
  
  /**
   * Constructeur du client Notion
   * 
   * @param config Configuration optionnelle (utilise la config de démo par défaut)
   */
  constructor(config: Partial<NotionConfig> = {}) {
    this.config = {
      ...DEFAULT_MOCK_CONFIG,
      ...config
    };
  }
  
  /**
   * Vérifie si le client est en mode de démonstration
   * 
   * @returns true si le client est en mode de démonstration
   */
  public isMockMode(): boolean {
    return this.config.mode === 'demo';
  }
  
  /**
   * Récupère la configuration actuelle du client
   * 
   * @returns Configuration actuelle
   */
  public getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Définit la configuration du client
   * 
   * @param config Nouvelle configuration (partielle ou complète)
   */
  public setConfig(config: Partial<NotionConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * Définit le mode d'opération du client
   * 
   * @param mode Mode d'opération ('real' ou 'demo')
   */
  public setMode(mode: 'real' | 'demo'): void {
    this.config.mode = mode;
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   * 
   * @param endpoint Point de terminaison de l'API
   * @returns Promise résolvant vers la réponse
   */
  public async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      console.log(`[MOCK] GET request to ${endpoint}`);
      return {
        success: false,
        error: { message: 'Mock mode active, but no mock data provided for this endpoint' }
      };
    }
    
    // Implémentation réelle à ajouter ultérieurement
    return {
      success: false,
      error: { message: 'Real API mode not yet implemented' }
    };
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   * 
   * @param endpoint Point de terminaison de l'API
   * @param data Données à envoyer
   * @returns Promise résolvant vers la réponse
   */
  public async post<T>(endpoint: string, data: unknown): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      console.log(`[MOCK] POST request to ${endpoint} with data:`, data);
      return {
        success: false,
        error: { message: 'Mock mode active, but no mock data provided for this endpoint' }
      };
    }
    
    // Implémentation réelle à ajouter ultérieurement
    return {
      success: false,
      error: { message: 'Real API mode not yet implemented' }
    };
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   * 
   * @param endpoint Point de terminaison de l'API
   * @param data Données à envoyer
   * @returns Promise résolvant vers la réponse
   */
  public async patch<T>(endpoint: string, data: unknown): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      console.log(`[MOCK] PATCH request to ${endpoint} with data:`, data);
      return {
        success: false,
        error: { message: 'Mock mode active, but no mock data provided for this endpoint' }
      };
    }
    
    // Implémentation réelle à ajouter ultérieurement
    return {
      success: false,
      error: { message: 'Real API mode not yet implemented' }
    };
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   * 
   * @param endpoint Point de terminaison de l'API
   * @returns Promise résolvant vers la réponse
   */
  public async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      console.log(`[MOCK] DELETE request to ${endpoint}`);
      return {
        success: false,
        error: { message: 'Mock mode active, but no mock data provided for this endpoint' }
      };
    }
    
    // Implémentation réelle à ajouter ultérieurement
    return {
      success: false,
      error: { message: 'Real API mode not yet implemented' }
    };
  }
}

/**
 * Instance partagée du client Notion
 */
export const notionClient = new NotionClient();

/**
 * Réinitialise le client Notion avec une nouvelle configuration
 * 
 * @param config Nouvelle configuration
 */
export function resetNotionClient(config: Partial<NotionConfig> = {}): void {
  notionClient.setConfig({
    ...DEFAULT_MOCK_CONFIG,
    ...config
  });
}

export default notionClient;
