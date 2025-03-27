
import { NotionResponse } from '../types';

/**
 * Client Notion en mode démonstration
 * 
 * Fournit un client factice qui simule les réponses de l'API Notion
 * sans effectuer de requêtes réelles. Utile pour les tests et le développement.
 */
export class NotionMockClient {
  /**
   * Configuration actuelle
   */
  private config: Record<string, string> | null = null;
  
  /**
   * Délai de simulation (ms)
   */
  private delay = 300;
  
  /**
   * Effectue une requête GET simulée
   */
  async get<T>(_endpoint: string): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {} as T
    };
  }
  
  /**
   * Effectue une requête POST simulée
   */
  async post<T>(_endpoint: string, _data: unknown): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {} as T
    };
  }
  
  /**
   * Effectue une requête PATCH simulée
   */
  async patch<T>(_endpoint: string, _data: unknown): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {} as T
    };
  }
  
  /**
   * Effectue une requête DELETE simulée
   */
  async delete<T>(_endpoint: string): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {} as T
    };
  }
  
  /**
   * Définit la configuration
   */
  setConfig(config: Record<string, string>) {
    this.config = config;
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig() {
    return this.config;
  }
  
  /**
   * Simule un délai pour mieux représenter les requêtes réseau
   */
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

// Exporter une instance par défaut
export const notionMockClient = new NotionMockClient();
export default notionMockClient;
