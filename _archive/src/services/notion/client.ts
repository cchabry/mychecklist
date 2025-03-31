
import { cacheService } from '../cache';

// Types d'état de connexion Notion
export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

// Interface pour les réponses de l'API Notion
export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface NotionAPIListResponse {
  object: 'list';
  results: any[];
  next_cursor: string | null;
  has_more: boolean;
  [key: string]: any;
}

export interface NotionAPIPage {
  id: string;
  object: 'page';
  properties: {
    [key: string]: any;
  };
  url: string;
  created_time: string;
  last_edited_time: string;
  [key: string]: any;
}

// Clé de cache pour le statut de connexion
const CONNECTION_STATUS_CACHE_KEY = 'notion_connection_status';

/**
 * Client de base pour l'API Notion
 */
class NotionClient {
  private apiKey: string | null = null;
  private databaseId: string | null = null;
  private checklistsDbId: string | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  
  /**
   * Configure le client Notion avec les informations d'identification
   */
  configure(apiKey: string, databaseId: string, checklistsDbId?: string): void {
    this.apiKey = apiKey;
    this.databaseId = databaseId;
    this.checklistsDbId = checklistsDbId || null;
    
    // Stocker les informations dans le localStorage
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', databaseId);
    
    if (checklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', checklistsDbId);
    }
    
    this.connectionStatus = ConnectionStatus.Connected;
    
    // Stocker le statut de connexion dans le cache
    cacheService.set(CONNECTION_STATUS_CACHE_KEY, this.connectionStatus);
  }
  
  /**
   * Vérifie si le client est configuré
   */
  isConfigured(): boolean {
    if (this.apiKey && this.databaseId) {
      return true;
    }
    
    // Vérifier si les informations sont stockées dans le localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const databaseId = localStorage.getItem('notion_database_id');
    
    // Mettre à jour les propriétés si les informations sont trouvées
    if (apiKey && databaseId) {
      this.apiKey = apiKey;
      this.databaseId = databaseId;
      
      const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      if (checklistsDbId) {
        this.checklistsDbId = checklistsDbId;
      }
      
      // Récupérer le statut de connexion depuis le cache
      const cachedStatus = cacheService.get<ConnectionStatus>(CONNECTION_STATUS_CACHE_KEY);
      if (cachedStatus) {
        this.connectionStatus = cachedStatus;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Récupère le statut de connexion actuel
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Définit le statut de connexion
   */
  setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    
    // Stocker le statut de connexion dans le cache
    cacheService.set(CONNECTION_STATUS_CACHE_KEY, status);
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<NotionAPIResponse<{user: string}>> {
    try {
      const response = await this.get<{results: Array<{name: string, id: string}>}>('/users');
      
      if (response.success && response.data && response.data.results && response.data.results.length > 0) {
        const user = response.data.results[0].name || response.data.results[0].id;
        this.setConnectionStatus(ConnectionStatus.Connected);
        return {
          success: true,
          data: { user }
        };
      }
      
      this.setConnectionStatus(ConnectionStatus.Error);
      return {
        success: false,
        error: {
          message: "Aucun utilisateur trouvé dans la réponse Notion"
        }
      };
    } catch (error) {
      this.setConnectionStatus(ConnectionStatus.Error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erreur de connexion à Notion"
        }
      };
    }
  }
  
  /**
   * Effectue une requête GET à l'API Notion
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<NotionAPIResponse<T>> {
    return this.request<T>('GET', endpoint, params);
  }
  
  /**
   * Effectue une requête POST à l'API Notion
   */
  async post<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }
  
  /**
   * Effectue une requête PATCH à l'API Notion
   */
  async patch<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }
  
  /**
   * Effectue une requête DELETE à l'API Notion
   */
  async delete<T>(endpoint: string): Promise<NotionAPIResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
  
  /**
   * Méthode de base pour effectuer des requêtes à l'API Notion
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data: any = null
  ): Promise<NotionAPIResponse<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: "Client Notion non configuré"
        }
      };
    }
    
    const apiKey = this.apiKey || localStorage.getItem('notion_api_key');
    if (!apiKey) {
      return {
        success: false,
        error: {
          message: "Clé API Notion manquante"
        }
      };
    }
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
    
    const baseUrl = 'https://api.notion.com/v1';
    const url = `${baseUrl}${endpoint}`;
    
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
      
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();
      
      if (!response.ok) {
        // Mettre à jour le statut de connexion en cas d'erreur d'authentification
        if (response.status === 401) {
          this.setConnectionStatus(ConnectionStatus.Error);
        }
        
        return {
          success: false,
          error: {
            message: responseData.message || `Erreur Notion: ${response.status}`,
            code: responseData.code,
            details: responseData
          }
        };
      }
      
      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      this.setConnectionStatus(ConnectionStatus.Error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Erreur lors de la requête Notion"
        }
      };
    }
  }
}

// Exporter une instance du client Notion
export const notionClient = new NotionClient();

// Exporter le service Notion pour être utilisé dans d'autres parties de l'application
export const notionService = {
  isConfigured: () => notionClient.isConfigured(),
  configure: (apiKey: string, databaseId: string, checklistsDbId?: string) => 
    notionClient.configure(apiKey, databaseId, checklistsDbId),
  testConnection: () => notionClient.testConnection(),
  getConnectionStatus: () => notionClient.getConnectionStatus(),
  setConnectionStatus: (status: ConnectionStatus) => notionClient.setConnectionStatus(status)
};
