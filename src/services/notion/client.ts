
import { toast } from 'sonner';

// Types de base pour l'API Notion
export interface NotionClientConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId?: string;
}

export interface NotionAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Interface pour les réponses de l'API Notion qui contiennent des résultats
export interface NotionAPIListResponse {
  results: any[];
  next_cursor: string | null;
  has_more: boolean;
}

// Interface pour les objets Page de Notion
export interface NotionAPIPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
  [key: string]: any;
}

// État de connexion Notion
export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  Connecting = 'connecting',
  Error = 'error'
}

// Configuration de base
const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Client Notion centralisé qui gère toutes les interactions avec l'API Notion
 */
export class NotionClient {
  private apiKey: string | null = null;
  private databaseId: string | null = null;
  private checklistsDbId: string | null = null;
  private status: ConnectionStatus = ConnectionStatus.Disconnected;
  private lastError: Error | null = null;
  
  constructor() {
    this.loadConfig();
  }
  
  /**
   * Charge la configuration depuis le localStorage
   */
  private loadConfig(): void {
    try {
      this.apiKey = localStorage.getItem('notion_api_key');
      this.databaseId = localStorage.getItem('notion_database_id');
      this.checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      
      console.log('Configuration Notion chargée:', {
        hasApiKey: !!this.apiKey,
        hasDatabaseId: !!this.databaseId,
        hasChecklistsDbId: !!this.checklistsDbId
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration Notion:', error);
    }
  }
  
  /**
   * Définit la configuration du client
   */
  public setConfig(config: NotionClientConfig): void {
    this.apiKey = config.apiKey;
    this.databaseId = config.databaseId;
    this.checklistsDbId = config.checklistsDbId || null;
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('notion_api_key', config.apiKey);
      localStorage.setItem('notion_database_id', config.databaseId);
      
      if (config.checklistsDbId) {
        localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
      }
      
      localStorage.setItem('notion_last_config_date', new Date().toISOString());
      
      console.log('Configuration Notion sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration Notion:', error);
    }
  }
  
  /**
   * Vérifie si le client est configuré
   */
  public isConfigured(): boolean {
    return !!this.apiKey && !!this.databaseId;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  public async testConnection(): Promise<NotionAPIResponse<{user: string, databases: {projectsDb: string, checklistsDb?: string}}>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: 'Client Notion non configuré',
          code: 'not_configured'
        }
      };
    }
    
    try {
      this.status = ConnectionStatus.Connecting;
      
      // 1. Tester l'accès à l'API Users
      const userResponse = await this.request<{id: string, name: string, avatar_url: string}>('/users/me');
      
      if (!userResponse.success) {
        this.status = ConnectionStatus.Error;
        return {
          success: false,
          error: userResponse.error
        };
      }
      
      // 2. Tester l'accès à la base de données de projets
      const dbResponse = await this.request<{id: string, title: Array<{plain_text: string}>}>(`/databases/${this.databaseId}`);
      
      if (!dbResponse.success) {
        this.status = ConnectionStatus.Error;
        return {
          success: false,
          error: {
            message: 'Échec de l\'accès à la base de données des projets',
            details: dbResponse.error
          }
        };
      }
      
      // Convertir les réponses en format attendu
      const result: NotionAPIResponse<{user: string, databases: {projectsDb: string, checklistsDb?: string}}> = {
        success: true,
        data: {
          user: userResponse.data?.name || 'Utilisateur Notion',
          databases: {
            projectsDb: dbResponse.data?.title?.[0]?.plain_text || this.databaseId || 'Base de données de projets'
          }
        }
      };
      
      // 3. Tester l'accès à la base de données de checklists si configurée
      if (this.checklistsDbId) {
        const checklistsDbResponse = await this.request<{id: string, title: Array<{plain_text: string}>}>(`/databases/${this.checklistsDbId}`);
        
        if (checklistsDbResponse.success) {
          result.data!.databases.checklistsDb = checklistsDbResponse.data?.title?.[0]?.plain_text || 'Base de données de checklists';
        } else {
          result.success = false;
          result.error = {
            message: 'Échec de l\'accès à la base de données des checklists',
            details: checklistsDbResponse.error
          };
        }
      }
      
      this.status = result.success ? ConnectionStatus.Connected : ConnectionStatus.Error;
      return result;
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error(String(error));
      this.status = ConnectionStatus.Error;
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue lors du test de connexion',
          details: error
        }
      };
    }
  }
  
  /**
   * Méthode générique pour effectuer des requêtes à l'API Notion avec gestion d'erreurs
   */
  public async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any
  ): Promise<NotionAPIResponse<T>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'Clé API Notion manquante',
          code: 'missing_api_key'
        }
      };
    }
    
    // Normaliser l'endpoint
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${NOTION_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    };
    
    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };
    
    // Gestion du timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    config.signal = controller.signal;
    
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Extraire et formater le message d'erreur
        const errorMessage = data.message || data.error?.message || `Erreur ${response.status}`;
        
        return {
          success: false,
          error: {
            message: errorMessage,
            code: data.code || String(response.status),
            details: data
          }
        };
      }
      
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Traiter les erreurs de réseau
      if (error instanceof Error) {
        // Erreur d'abandon (timeout)
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: {
              message: `La requête a expiré après ${REQUEST_TIMEOUT_MS/1000} secondes`,
              code: 'timeout',
              details: error
            }
          };
        }
        
        // Erreur CORS (Cross-Origin)
        if (error.message.includes('Failed to fetch')) {
          return {
            success: false,
            error: {
              message: 'Problème d\'accès à l\'API Notion (CORS). Un proxy est nécessaire.',
              code: 'cors_error',
              details: error
            }
          };
        }
        
        // Autres erreurs
        return {
          success: false,
          error: {
            message: error.message,
            code: error.name,
            details: error
          }
        };
      }
      
      // Erreur inconnue
      return {
        success: false,
        error: {
          message: 'Erreur inconnue lors de la requête',
          details: error
        }
      };
    }
  }
  
  /**
   * Méthode d'assistance pour les requêtes GET
   */
  public async get<T>(endpoint: string): Promise<NotionAPIResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }
  
  /**
   * Méthode d'assistance pour les requêtes POST
   */
  public async post<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    return this.request<T>(endpoint, 'POST', data);
  }
  
  /**
   * Méthode d'assistance pour les requêtes PATCH
   */
  public async patch<T>(endpoint: string, data: any): Promise<NotionAPIResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data);
  }
  
  /**
   * Méthode d'assistance pour les requêtes DELETE
   */
  public async delete<T>(endpoint: string): Promise<NotionAPIResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }
  
  /**
   * Retourne l'état actuel de la connexion
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }
  
  /**
   * Retourne la dernière erreur rencontrée
   */
  public getLastError(): Error | null {
    return this.lastError;
  }
  
  /**
   * Méthodes d'extraction de propriétés Notion
   */
  public static extractors = {
    getRichTextValue: (property: any): string => {
      if (!property || !property.rich_text) return '';
      
      if (Array.isArray(property.rich_text) && property.rich_text.length > 0) {
        return property.rich_text.map((rt: any) => rt.plain_text).join('');
      }
      
      return '';
    },
    
    getTitleValue: (property: any): string => {
      if (!property || !property.title) return '';
      
      if (Array.isArray(property.title) && property.title.length > 0) {
        return property.title.map((t: any) => t.plain_text).join('');
      }
      
      return '';
    },
    
    getNumberValue: (property: any): number => {
      if (!property || property.type !== 'number') return 0;
      return property.number || 0;
    },
    
    getDateValue: (property: any): string | null => {
      if (!property || property.type !== 'date' || !property.date) return null;
      return property.date.start || null;
    },
    
    getSelectValue: (property: any): string => {
      if (!property || property.type !== 'select' || !property.select) return '';
      return property.select.name || '';
    }
  }
}

// Créer et exporter une instance unique du client Notion
export const notionClient = new NotionClient();
