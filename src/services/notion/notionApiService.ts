
/**
 * Service central et unifié pour l'API Notion
 * Point d'entrée UNIQUE pour tous les appels à l'API Notion
 */
import { toast } from 'sonner';
import { notionCentralService } from './notionCentralService';

// Types pour le service API
export type NotionApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
    code?: string;
  };
};

/**
 * Service API Notion unifié
 * Ce service est la SEULE façon autorisée d'accéder à l'API Notion
 */
export const notionApiService = {
  /**
   * Exécute une requête à l'API Notion via le proxy Netlify
   */
  async request<T = any>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string
  ): Promise<NotionApiResponse<T>> {
    try {
      console.log(`📡 notionApiService: ${method} ${endpoint}`);
      
      // Utiliser exclusivement le service central
      const response = await notionCentralService.request<T>({
        endpoint,
        method: method as any,
        body,
        token
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Erreur API Notion (${method} ${endpoint}):`, error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur de communication avec l\'API Notion';
      
      return {
        success: false,
        error: {
          message: errorMessage,
          details: error
        }
      };
    }
  },
  
  /**
   * Vérifie si la connexion à l'API Notion fonctionne
   */
  async testConnection(token?: string): Promise<NotionApiResponse<{ user: string }>> {
    try {
      const response = await this.request('/users/me', 'GET', undefined, token);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            user: response.data.name || response.data.id || 'Utilisateur Notion'
          }
        };
      }
      
      return {
        success: false,
        error: {
          message: 'Impossible de récupérer les informations utilisateur',
          details: response.error
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur de connexion à Notion',
          details: error
        }
      };
    }
  },
  
  /**
   * ===== API PROJETS =====
   */
  projects: {
    /**
     * Récupère tous les projets
     */
    async getAll(): Promise<NotionApiResponse<any[]>> {
      return notionApiService.request('/projects');
    },
    
    /**
     * Récupère un projet par son ID
     */
    async getById(projectId: string): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/projects/${projectId}`);
    },
    
    /**
     * Crée un nouveau projet
     */
    async create(data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/projects', 'POST', data);
    },
    
    /**
     * Met à jour un projet existant
     */
    async update(projectId: string, data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/projects/${projectId}`, 'PATCH', data);
    }
  },
  
  /**
   * ===== API EXIGENCES =====
   */
  exigences: {
    /**
     * Récupère toutes les exigences d'un projet
     */
    async getByProject(projectId: string): Promise<NotionApiResponse<any[]>> {
      return notionApiService.request(`/exigences/${projectId}`);
    },
    
    /**
     * Crée une nouvelle exigence
     */
    async create(data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/exigences', 'POST', data);
    },
    
    /**
     * Met à jour une exigence existante
     */
    async update(exigenceId: string, data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/exigences/${exigenceId}`, 'PUT', data);
    }
  },
  
  /**
   * ===== API AUDITS =====
   */
  audits: {
    /**
     * Récupère tous les audits d'un projet
     */
    async getByProject(projectId: string): Promise<NotionApiResponse<any[]>> {
      return notionApiService.request(`/audits/${projectId}`);
    },
    
    /**
     * Récupère un audit par son ID
     */
    async getById(auditId: string): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/audits/${auditId}`);
    },
    
    /**
     * Crée un nouvel audit
     */
    async create(data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/audits', 'POST', data);
    },
    
    /**
     * Met à jour un audit existant
     */
    async update(auditId: string, data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/audits/${auditId}`, 'PATCH', data);
    }
  },
  
  /**
   * ===== API UTILISATEURS =====
   * Pour compatibilité avec l'ancien code
   */
  users: {
    /**
     * Récupère l'utilisateur actuel
     */
    async me(): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/users/me');
    },
    
    /**
     * Liste tous les utilisateurs
     */
    async list(): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/users');
    }
  },
  
  /**
   * ===== API BASES DE DONNÉES =====
   * Pour compatibilité avec l'ancien code
   */
  databases: {
    /**
     * Récupère les informations d'une base de données
     */
    async retrieve(databaseId: string): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/databases/${databaseId}`);
    },
    
    /**
     * Exécute une requête sur une base de données
     */
    async query(databaseId: string, params: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/databases/${databaseId}/query`, 'POST', params);
    }
  },
  
  /**
   * ===== COMPATIBILITÉ AVEC L'ANCIEN MODE DÉMO =====
   */
  mockMode: {
    isActive: () => false,
    enable: () => {
      console.warn('Mode démo déprécié, utiliser operationMode');
      return Promise.resolve();
    },
    disable: () => {
      console.warn('Mode démo déprécié, utiliser operationMode');
      return Promise.resolve();
    },
    reset: () => {
      console.warn('Mode démo déprécié, utiliser operationMode');
      return Promise.resolve();
    },
    forceReset: () => {
      console.warn('Mode démo déprécié, utiliser operationMode');
      return Promise.resolve(); 
    }
  }
};

export default notionApiService;
