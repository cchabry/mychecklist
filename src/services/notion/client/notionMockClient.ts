
/**
 * Client Notion en mode démonstration
 * 
 * Fournit un client factice qui simule les réponses de l'API Notion
 * sans effectuer de requêtes réelles. Utile pour les tests et le développement.
 */

import { NotionResponse, ConnectionTestResult } from '../types';

/**
 * Client Notion pour le mode démonstration
 * 
 * Simule les interactions avec l'API Notion sans effectuer de véritables
 * requêtes HTTP. Implémente la même interface que le client HTTP.
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
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat simulé
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    // Pour les requêtes concernant les utilisateurs, retourner un utilisateur fictif
    if (endpoint === '/users/me') {
      return {
        success: true,
        data: {
          id: 'mock-user-id',
          name: 'Utilisateur Démo',
          workspace_name: 'Workspace Démo'
        } as unknown as T
      };
    }
    
    // Pour les requêtes concernant les bases de données, retourner un titre fictif
    if (endpoint.startsWith('/databases/')) {
      const dbId = endpoint.split('/').pop();
      return {
        success: true,
        data: {
          id: dbId,
          title: [{ plain_text: `Base démo ${dbId}` }]
        } as unknown as T
      };
    }
    
    return {
      success: true,
      data: {} as T
    };
  }
  
  /**
   * Effectue une requête POST simulée
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat simulé
   */
  async post<T>(_endpoint: string, _data: unknown): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {
        id: `mock-${Date.now()}`,
        created_time: new Date().toISOString()
      } as unknown as T
    };
  }
  
  /**
   * Effectue une requête PATCH simulée
   * @param endpoint Point d'entrée API
   * @param data Données à envoyer
   * @returns Promise avec le résultat simulé
   */
  async patch<T>(_endpoint: string, data: unknown): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: {
        ...data,
        last_edited_time: new Date().toISOString()
      } as unknown as T
    };
  }
  
  /**
   * Effectue une requête DELETE simulée
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat simulé
   */
  async delete<T>(_endpoint: string): Promise<NotionResponse<T>> {
    await this.simulateDelay();
    
    return {
      success: true,
      data: { deleted: true } as unknown as T
    };
  }
  
  /**
   * Définit la configuration
   * @param config Configuration à appliquer
   */
  setConfig(config: Record<string, string>) {
    this.config = config;
  }
  
  /**
   * Récupère la configuration actuelle
   * @returns Configuration actuelle
   */
  getConfig() {
    return this.config;
  }
  
  /**
   * Teste la connexion à l'API Notion (simulée)
   * @returns Résultat du test simulé (toujours réussi)
   */
  async testConnection(): Promise<ConnectionTestResult> {
    await this.simulateDelay();
    
    return {
      success: true,
      user: 'Utilisateur démo',
      workspaceName: 'Workspace démo',
      projectsDbName: 'Projets (démo)',
      checklistsDbName: 'Checklists (démo)'
    };
  }
  
  /**
   * Simule un délai pour mieux représenter les requêtes réseau
   * @returns Promise résolue après le délai
   */
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

// Exporter une instance par défaut
export const notionMockClient = new NotionMockClient();
export default notionMockClient;
