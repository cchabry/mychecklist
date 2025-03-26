
/**
 * Client pour l'API Notion
 * Fournit les fonctionnalités de base pour interagir avec l'API Notion
 */

import { 
  ConnectionStatus, 
  NotionResponse, 
  NotionConfig,
  NotionUser,
  ConnectionTestResult
} from './types';

/**
 * Client API Notion simplifié
 */
export class NotionClient {
  private apiKey: string | null = null;
  private projectsDbId: string | null = null;
  private checklistsDbId: string | null = null;
  private mockMode: boolean = false;
  private debug: boolean = false;
  
  /**
   * Configure le client avec les informations Notion
   */
  configure(config: NotionConfig): void {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      localStorage.setItem('notion_api_key', config.apiKey);
    }
    
    if (config.projectsDbId) {
      this.projectsDbId = config.projectsDbId;
      localStorage.setItem('notion_database_id', config.projectsDbId);
    }
    
    if (config.checklistsDbId) {
      this.checklistsDbId = config.checklistsDbId;
      localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
    }
    
    this.mockMode = config.mockMode || false;
    this.debug = config.debug || false;
    
    // Enregistrer la date de configuration
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    // Vérifier d'abord les propriétés de l'instance
    if (this.apiKey && this.projectsDbId) {
      return true;
    }
    
    // Sinon, vérifier le localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    
    if (apiKey && projectsDbId) {
      // Mettre à jour les propriétés de l'instance
      this.apiKey = apiKey;
      this.projectsDbId = projectsDbId;
      
      const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      if (checklistsDbId) {
        this.checklistsDbId = checklistsDbId;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return {
      apiKey: this.apiKey || localStorage.getItem('notion_api_key') || undefined,
      projectsDbId: this.projectsDbId || localStorage.getItem('notion_database_id') || undefined,
      checklistsDbId: this.checklistsDbId || localStorage.getItem('notion_checklists_database_id') || undefined,
      mockMode: this.mockMode,
      debug: this.debug
    };
  }
  
  /**
   * Active ou désactive le mode démo (mock)
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
  
  /**
   * Vérifie si le mode démo est actif
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
  
  /**
   * Effectue une requête GET à l'API Notion
   */
  async get<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.request<T>('GET', endpoint);
  }
  
  /**
   * Effectue une requête POST à l'API Notion
   */
  async post<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH à l'API Notion
   */
  async patch<T>(endpoint: string, data: any): Promise<NotionResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE à l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Client Notion non configuré"
      };
    }
    
    try {
      const usersResponse = await this.get<{results: NotionUser[]}>('/users');
      
      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          error: usersResponse.error?.message || "Erreur lors de la récupération des utilisateurs"
        };
      }
      
      const user = usersResponse.data.results[0];
      
      // Tester l'accès à la base de données des projets
      let projectsDbName = "";
      try {
        const dbResponse = await this.get<{title: Array<{plain_text: string}>}>(`/databases/${this.projectsDbId}`);
        if (dbResponse.success && dbResponse.data?.title) {
          projectsDbName = dbResponse.data.title[0]?.plain_text || this.projectsDbId || "";
        }
      } catch (error) {
        return {
          success: false,
          error: "Échec de l'accès à la base de données des projets",
          details: error instanceof Error ? error.message : String(error)
        };
      }
      
      // Tester l'accès à la base de données des checklists si configurée
      let checklistsDbName = "";
      if (this.checklistsDbId) {
        try {
          const checklistDbResponse = await this.get<{title: Array<{plain_text: string}>}>(`/databases/${this.checklistsDbId}`);
          if (checklistDbResponse.success && checklistDbResponse.data?.title) {
            checklistsDbName = checklistDbResponse.data.title[0]?.plain_text || this.checklistsDbId || "";
          }
        } catch (error) {
          // Ne pas échouer le test complet si seule la base de checklists est inaccessible
          console.warn("Avertissement: Échec de l'accès à la base de données des checklists:", error);
        }
      }
      
      return {
        success: true,
        user: user.name || user.id,
        projectsDbName,
        checklistsDbName
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue lors du test de connexion",
        details: error
      };
    }
  }
  
  /**
   * Méthode de base pour effectuer des requêtes à l'API Notion
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data: any = null
  ): Promise<NotionResponse<T>> {
    if (this.mockMode) {
      console.log(`[MockMode] ${method} ${endpoint}`, data);
      // En mode mock, on devrait renvoyer des données mockées
      return {
        success: true,
        data: null as unknown as T
      };
    }
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: { message: "Client Notion non configuré" }
      };
    }
    
    const apiKey = this.apiKey || localStorage.getItem('notion_api_key');
    if (!apiKey) {
      return {
        success: false,
        error: { message: "Clé API Notion manquante" }
      };
    }
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
    
    const baseUrl = 'https://api.notion.com/v1';
    let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    try {
      // Configuration de la requête
      const requestOptions: RequestInit = {
        method,
        headers
      };
      
      // Ajouter les données pour les requêtes non-GET
      if (method !== 'GET' && data !== null) {
        requestOptions.body = JSON.stringify(data);
      }
      
      // Utiliser un proxy CORS pour les requêtes depuis le navigateur
      if (typeof window !== 'undefined') {
        // Dans un environnement de production, on utiliserait un proxy
        if (process.env.NODE_ENV === 'production') {
          // URL du proxy selon la plateforme (Netlify, Vercel, etc.)
          const proxyUrl = '/.netlify/functions/notion-proxy';
          url = proxyUrl;
          
          // Adapter les options pour le proxy
          requestOptions.method = 'POST';
          requestOptions.body = JSON.stringify({
            method,
            endpoint,
            data,
            token: apiKey
          });
        } else {
          // En développement local, utiliser un service de proxy CORS
          url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        }
      }
      
      if (this.debug) {
        console.log(`[NotionClient] ${method} ${endpoint}`, requestOptions);
      }
      
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: responseData.message || `Erreur Notion: ${response.status}`,
            code: responseData.code,
            status: response.status,
            details: responseData
          }
        };
      }
      
      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erreur lors de la requête Notion"
        }
      };
    }
  }
}

// Exporter une instance singleton
export const notionClient = new NotionClient();

// Exporter par défaut
export default notionClient;
