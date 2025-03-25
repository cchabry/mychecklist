
/**
 * Service central et unifié pour l'API Notion
 * Point d'entrée UNIQUE pour tous les appels à l'API Notion
 */
import { toast } from 'sonner';
import { notionCentralService } from './notionCentralService';
import { notionErrorService } from './errorHandling';
import { NotionErrorType } from './types/unified';

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

// Variables pour le mode démo
let mockModeActive = false;
let temporarilyForcedReal = false;
let previousMockState = false;

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
      
      // Utiliser le nouveau service d'erreur
      notionErrorService.reportError(error, endpoint, {
        type: NotionErrorType.API,
        operation: `${method} ${endpoint}`
      });
      
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
    },
    
    /**
     * Supprime un projet existant
     */
    async delete(projectId: string): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/projects/${projectId}`, 'DELETE');
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
    },
    
    /**
     * Récupère tous les audits (pour rétrocompatibilité)
     */
    async getAuditsByProject(projectId: string): Promise<NotionApiResponse<any[]>> {
      return this.getByProject(projectId);
    },
    
    /**
     * Récupère un audit (pour rétrocompatibilité)
     */
    async getAudit(auditId: string): Promise<NotionApiResponse<any>> {
      return this.getById(auditId);
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
    },
    
    /**
     * Liste toutes les bases de données
     */
    async list(): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/databases');
    }
  },
  
  /**
   * ===== API PAGES =====
   * Pour compatibilité avec l'ancien code
   */
  pages: {
    /**
     * Récupère une page
     */
    async retrieve(pageId: string): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/pages/${pageId}`);
    },
    
    /**
     * Crée une nouvelle page
     */
    async create(data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request('/pages', 'POST', data);
    },
    
    /**
     * Met à jour une page existante
     */
    async update(pageId: string, data: any): Promise<NotionApiResponse<any>> {
      return notionApiService.request(`/pages/${pageId}`, 'PATCH', data);
    },
    
    /**
     * Crée une page de test (pour compatibilité)
     */
    async createSamplePage(databaseId: string, data: any): Promise<NotionApiResponse<any>> {
      return this.create({
        parent: { database_id: databaseId },
        properties: data
      });
    }
  },
  
  /**
   * ===== MODE DÉMO =====
   * Pour compatibilité avec l'ancien code
   */
  mockMode: {
    /**
     * Vérifie si le mode démo est actif
     */
    isActive: () => mockModeActive,
    
    /**
     * Active le mode démo
     */
    enable: async () => {
      mockModeActive = true;
      toast.success('Mode démo activé');
      return Promise.resolve();
    },
    
    /**
     * Désactive le mode démo
     */
    disable: async () => {
      mockModeActive = false;
      toast.success('Mode démo désactivé');
      return Promise.resolve();
    },
    
    /**
     * Réinitialise le mode démo
     */
    reset: async () => {
      mockModeActive = false;
      return Promise.resolve();
    },
    
    /**
     * Force la réinitialisation du mode démo
     */
    forceReset: async () => {
      mockModeActive = false;
      return Promise.resolve();
    },
    
    /**
     * Active le mode démo (raccourci pour enable)
     */
    activate: async () => {
      return notionApiService.mockMode.enable();
    },
    
    /**
     * Désactive le mode démo (raccourci pour disable)
     */
    deactivate: async () => {
      return notionApiService.mockMode.disable();
    },
    
    /**
     * Force temporairement le mode réel
     */
    temporarilyForceReal: () => {
      if (mockModeActive) {
        previousMockState = true;
        mockModeActive = false;
        temporarilyForcedReal = true;
        console.log('Mode réel temporairement forcé (les appels API seront réels)');
      }
    },
    
    /**
     * Restaure l'état précédent après avoir forcé le mode réel
     */
    restoreAfterForceReal: () => {
      if (temporarilyForcedReal) {
        mockModeActive = previousMockState;
        temporarilyForcedReal = false;
        previousMockState = false;
        console.log('État précédent du mode démo restauré');
      }
    },
    
    /**
     * Vérifie si le mode réel est temporairement forcé
     */
    isTemporarilyForcedReal: () => temporarilyForcedReal
  }
};

export default notionApiService;
