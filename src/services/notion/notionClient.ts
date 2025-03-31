
/**
 * Client HTTP pour l'API Notion
 */

import { NotionConfig, NotionResponse, ConnectionTestResult, NotionError } from './types';

/**
 * Client HTTP pour l'API Notion
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
    return !!this.config.mockMode;
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
    return this.request<T>('GET', endpoint);
  }
  
  /**
   * Effectue une requête POST vers l'API Notion
   */
  async post<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH vers l'API Notion
   */
  async patch<T>(endpoint: string, data?: any): Promise<NotionResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE vers l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
  
  /**
   * Effectue une requête HTTP vers l'API Notion
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<NotionResponse<T>> {
    // En mode mock, simuler une réponse réussie
    if (this.isMockMode()) {
      // Attendre pour simuler une latence réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retourner une réponse simulée
      return {
        success: true,
        data: {} as T
      };
    }
    
    // Vérifier que le client est configuré
    if (!this.config.apiKey) {
      return {
        success: false,
        error: {
          message: 'Clé API Notion non configurée'
        }
      };
    }
    
    try {
      // Construire l'URL de l'API
      const baseUrl = 'https://api.notion.com/v1';
      const url = `${baseUrl}${endpoint}`;
      
      // Construire les headers de la requête
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };
      
      // Construire les options de la requête
      const options: RequestInit = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
      };
      
      // En mode debug, afficher les informations de la requête
      if (this.config.debug) {
        console.log(`[Notion API] ${method} ${endpoint}`);
        if (data) console.log('[Notion API] Body:', data);
      }
      
      // Effectuer la requête
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      // Si la requête a échoué, retourner une erreur
      if (!response.ok) {
        const error: NotionError = {
          message: responseData.message || 'Erreur lors de la requête Notion',
          code: responseData.code,
          status: response.status,
          details: responseData
        };
        
        // En mode debug, afficher l'erreur
        if (this.config.debug) {
          console.error('[Notion API] Error:', error);
        }
        
        return {
          success: false,
          error
        };
      }
      
      // En mode debug, afficher les données de la réponse
      if (this.config.debug) {
        console.log('[Notion API] Response:', responseData);
      }
      
      // Retourner les données de la réponse
      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      // En mode debug, afficher l'erreur
      if (this.config.debug) {
        console.error('[Notion API] Exception:', error);
      }
      
      // Retourner une erreur
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue lors de la requête Notion'
        }
      };
    }
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    // En mode mock, simuler une connexion réussie
    if (this.isMockMode()) {
      return {
        success: true,
        user: 'Utilisateur démo',
        workspaceName: 'Workspace démo',
        projectsDbName: 'Projets (démo)',
        checklistsDbName: 'Checklists (démo)'
      };
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
