/**
 * Service central et unifié pour l'API Notion
 * Point d'entrée UNIQUE pour tous les appels à l'API Notion
 */
import { toast } from 'sonner';
import { notionCentralService } from './notionCentralService';
import { mockModeAdapter } from '@/lib/notionProxy/adapters/mockModeAdapter';

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
    },
    
    /**
     * Méthodes de compatibilité
     */
    get: async function(id: string): Promise<any> {
      const response = await notionApiService.projects.getById(id);
      return response.data || null;
    },
    
    getProject: async function(id: string): Promise<any> {
      return this.get(id);
    },
    
    getProjects: async function(): Promise<any[]> {
      const response = await notionApiService.projects.getAll();
      return response.data || [];
    },
    
    createProject: async function(data: any): Promise<any> {
      const response = await notionApiService.projects.create(data);
      return response.data;
    },
    
    updateProject: async function(id: string, data: any): Promise<any> {
      const response = await notionApiService.projects.update(id, data);
      return response.data;
    },
    
    deleteProject: async function(id: string): Promise<any> {
      // Implémentation de la suppression avec l'archivage
      const response = await notionApiService.request(`/pages/${id}`, 'PATCH', { archived: true });
      return response.data;
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
     * Méthodes de compatibilité
     */
    getAudit: async function(id: string): Promise<any> {
      return this.getById(id);
    },
    
    getAuditsByProject: async function(projectId: string): Promise<any[]> {
      const response = await this.getByProject(projectId);
      return response.data || [];
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
     * Récupère toutes les bases de données
     */
    list: async function(): Promise<any[]> {
      const response = await notionApiService.request('/databases');
      return response.data || [];
    }
  },
  
  /**
   * API Pages pour compatibilité
   */
  pages: {
    create: async function(data: any): Promise<any> {
      const response = await notionApiService.request('/pages', 'POST', data);
      return response.data;
    },
    
    update: async function(pageId: string, data: any): Promise<any> {
      const response = await notionApiService.request(`/pages/${pageId}`, 'PATCH', data);
      return response.data;
    },
    
    retrieve: async function(pageId: string): Promise<any> {
      const response = await notionApiService.request(`/pages/${pageId}`);
      return response.data;
    }
  },
  
  /**
   * Méthodes de compatibilité avec l'ancien API
   */
  getProject: async function(id: string): Promise<any> {
    return this.projects.get(id);
  },
  
  getProjects: async function(): Promise<any[]> {
    return this.projects.getProjects();
  },
  
  getAudit: async function(id: string): Promise<any> {
    return this.audits.getAudit(id);
  },
  
  getAuditsByProject: async function(projectId: string): Promise<any[]> {
    return this.audits.getAuditsByProject(projectId);
  },
  
  createSamplePage: async function(data: any): Promise<any> {
    // Créer une page d'exemple pour les tests
    return this.pages.create({
      parent: { page_id: data.projectId },
      properties: {
        title: [{ text: { content: data.title || 'Page de test' } }]
      },
      content: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: data.description || 'Description de test' } }]
          }
        }
      ]
    });
  },
  
  /**
   * ===== COMPATIBILITÉ AVEC L'ANCIEN MODE DÉMO =====
   */
  mockMode: mockModeAdapter
};

export default notionApiService;
