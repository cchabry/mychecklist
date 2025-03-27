
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
import { operationModeService } from '@/services/operationMode/operationModeService';
import { testConnection } from './connectionTester';

/**
 * Client API Notion
 * 
 * Fournit une interface unifiée pour interagir avec l'API Notion,
 * en gérant automatiquement le basculement entre le mode réel et le mode démo.
 */
export class NotionClient {
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
    
    // Transmettre la configuration au client HTTP si en mode réel
    if (!this.isMockMode()) {
      notionHttpClient.configure(config);
    }
  }
  
  /**
   * Vérifie si le client est correctement configuré pour fonctionner
   * @returns true si la configuration minimale est présente
   */
  isConfigured(): boolean {
    // En mode démo, on considère toujours que le client est configuré
    if (this.isMockMode()) {
      return true;
    }
    
    // En mode réel, vérifier la présence des informations essentielles
    return !!this.config.apiKey && !!this.config.projectsDbId;
  }
  
  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Active ou désactive le mode mock
   * @param enabled État souhaité du mode mock
   */
  setMockMode(enabled: boolean): void {
    this.config.mockMode = enabled;
  }
  
  /**
   * Vérifie si le mode mock est actif, soit par configuration directe,
   * soit via le service de gestion du mode opérationnel
   * @returns true si le client est en mode mock/démo
   */
  isMockMode(): boolean {
    return !!this.config.mockMode || operationModeService.isDemoMode();
  }
  
  /**
   * Active ou désactive le mode debug
   * @param enabled État souhaité du mode debug
   */
  setDebugMode(enabled: boolean): void {
    this.config.debug = enabled;
  }
  
  /**
   * Effectue une requête GET vers l'API Notion
   * @param endpoint Point d'entrée API (ex: '/databases')
   * @returns Promise avec le résultat de la requête
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
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
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
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
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
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
    return this.isMockMode()
      ? notionMockClient.delete<T>(endpoint)
      : notionHttpClient.delete<T>(endpoint);
  }
  
  /**
   * Teste la connexion à l'API Notion
   * @returns Résultat du test de connexion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return testConnection(this.config, this.isMockMode());
  }
}

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Export par défaut
export default notionClient;
