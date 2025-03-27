
/**
 * Client Notion en mode démonstration
 * 
 * Fournit un client factice qui simule les réponses de l'API Notion
 * sans effectuer de requêtes réelles. Utile pour les tests et le développement.
 */

import { NotionConfig, NotionResponse, ConnectionTestResult } from '../../types';
import { mockDataGenerator } from './mockDataGenerators';

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
  private config: NotionConfig = {
    mockMode: true,
    debug: false
  };
  
  /**
   * Configure le client mock
   * @param config Configuration à appliquer
   */
  configure(config: NotionConfig): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Récupère la configuration actuelle
   * @returns Copie de la configuration actuelle
   */
  getConfig(): NotionConfig {
    return { ...this.config };
  }
  
  /**
   * Effectue une requête GET simulée
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat simulé
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    await mockDataGenerator.simulateDelay();
    
    // En mode debug, afficher les informations sur la requête
    if (this.config.debug) {
      console.log(`[Notion Mock] GET ${endpoint}`);
    }
    
    // Pour les requêtes concernant les utilisateurs, retourner un utilisateur fictif
    if (endpoint === '/users/me') {
      return {
        success: true,
        data: mockDataGenerator.generateMockUser() as unknown as T
      };
    }
    
    // Pour les requêtes concernant les bases de données, retourner un titre fictif
    if (endpoint.startsWith('/databases/')) {
      const dbId = endpoint.split('/').pop();
      return {
        success: true,
        data: {
          id: dbId,
          title: [{ plain_text: `Base démo ${dbId?.substring(0, 8)}` }],
          properties: mockDataGenerator.generateMockDatabaseProperties()
        } as unknown as T
      };
    }
    
    // Pour les requêtes de recherche dans les bases de données
    if (endpoint.startsWith('/databases/') && endpoint.includes('/query')) {
      return {
        success: true,
        data: {
          results: mockDataGenerator.generateMockResults(5),
          has_more: false,
          next_cursor: null
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
  async post<T>(endpoint: string, data: unknown): Promise<NotionResponse<T>> {
    await mockDataGenerator.simulateDelay();
    
    // En mode debug, afficher les informations sur la requête
    if (this.config.debug) {
      console.log(`[Notion Mock] POST ${endpoint}`, data);
    }
    
    // Pour les requêtes de création dans une base de données
    if (endpoint.startsWith('/databases/') && endpoint.includes('/pages')) {
      return {
        success: true,
        data: {
          id: `mock-${Date.now()}`,
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
          properties: data && typeof data === 'object' && 'properties' in data 
            ? data.properties 
            : mockDataGenerator.generateMockPageProperties()
        } as unknown as T
      };
    }
    
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
  async patch<T>(endpoint: string, data: unknown): Promise<NotionResponse<T>> {
    await mockDataGenerator.simulateDelay();
    
    // En mode debug, afficher les informations sur la requête
    if (this.config.debug) {
      console.log(`[Notion Mock] PATCH ${endpoint}`, data);
    }
    
    // Créer un nouvel objet pour éviter l'utilisation de l'opérateur spread sur un type inconnu
    const responseData: any = {
      id: endpoint.split('/').pop() || `mock-${Date.now()}`,
      last_edited_time: new Date().toISOString()
    };
    
    // Ajouter les propriétés de data si c'est un objet
    if (data && typeof data === 'object') {
      Object.assign(responseData, data);
    }
    
    return {
      success: true,
      data: responseData as T
    };
  }
  
  /**
   * Effectue une requête DELETE simulée
   * @param endpoint Point d'entrée API
   * @returns Promise avec le résultat simulé
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    await mockDataGenerator.simulateDelay();
    
    // En mode debug, afficher les informations sur la requête
    if (this.config.debug) {
      console.log(`[Notion Mock] DELETE ${endpoint}`);
    }
    
    return {
      success: true,
      data: { 
        id: endpoint.split('/').pop() || `mock-deleted-${Date.now()}`,
        deleted: true 
      } as unknown as T
    };
  }
  
  /**
   * Teste la connexion à l'API Notion (simulée)
   * @returns Résultat du test simulé (toujours réussi)
   */
  async testConnection(): Promise<ConnectionTestResult> {
    await mockDataGenerator.simulateDelay();
    
    return {
      success: true,
      user: 'Utilisateur démo',
      workspaceName: 'Workspace démo',
      projectsDbName: 'Projets (démo)',
      checklistsDbName: 'Checklists (démo)'
    };
  }
}

// Exporter une instance par défaut
export const notionMockClient = new NotionMockClient();
export default notionMockClient;
