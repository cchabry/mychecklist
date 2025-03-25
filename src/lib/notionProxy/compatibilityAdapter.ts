
/**
 * Adaptateur de compatibilité pour l'API Notion
 * Permet d'utiliser l'ancienne interface tout en appelant le nouveau service centralisé
 */

import { notionCentralService } from '@/services/notion/notionCentralService';
import { mockMode } from './mock/mode';

// Interfaces pour la compatibilité avec l'ancien système
interface NotionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

/**
 * Adaptateur de méthodes pour les différentes ressources Notion
 */
const usersAdapter = {
  me: async (token?: string) => {
    try {
      return await notionCentralService.users.me(token);
    } catch (error) {
      throw error;
    }
  },
  
  list: async (token?: string) => {
    try {
      return await notionCentralService.users.list(token);
    } catch (error) {
      throw error;
    }
  }
};

const databasesAdapter = {
  retrieve: async (databaseId: string, token?: string) => {
    try {
      return await notionCentralService.databases.retrieve(databaseId, token);
    } catch (error) {
      throw error;
    }
  },
  
  query: async (databaseId: string, query: any = {}, token?: string) => {
    try {
      return await notionCentralService.databases.query(databaseId, query, token);
    } catch (error) {
      throw error;
    }
  },
  
  list: async (token?: string) => {
    try {
      return await notionCentralService.databases.list(token);
    } catch (error) {
      throw error;
    }
  }
};

const pagesAdapter = {
  retrieve: async (pageId: string, token?: string) => {
    try {
      return await notionCentralService.pages.retrieve(pageId, token);
    } catch (error) {
      throw error;
    }
  },
  
  create: async (data: any, token?: string) => {
    try {
      return await notionCentralService.pages.create(data, token);
    } catch (error) {
      throw error;
    }
  },
  
  update: async (pageId: string, data: any, token?: string) => {
    try {
      return await notionCentralService.pages.update(pageId, data, token);
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Adaptateur pour les méthodes spécifiques aux projets
 */
const projectsAdapter = {
  getProjects: async () => {
    try {
      return await notionCentralService.projects.getAll();
    } catch (error) {
      throw error;
    }
  },
  
  getProject: async (projectId: string) => {
    try {
      return await notionCentralService.projects.getById(projectId);
    } catch (error) {
      throw error;
    }
  },
  
  createProject: async (data: any) => {
    try {
      return await notionCentralService.projects.create(data);
    } catch (error) {
      throw error;
    }
  },
  
  updateProject: async (projectId: string, data: any) => {
    try {
      return await notionCentralService.projects.update(projectId, data);
    } catch (error) {
      throw error;
    }
  },
  
  deleteProject: async (projectId: string) => {
    try {
      return await notionCentralService.projects.delete(projectId);
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Adaptateur pour les méthodes spécifiques aux audits
 */
const auditsAdapter = {
  getAudit: async (auditId: string) => {
    try {
      const response = await notionCentralService.get(`/audits/${auditId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getAuditsByProject: async (projectId: string) => {
    try {
      const response = await notionCentralService.get(`/projects/${projectId}/audits`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  createAudit: async (data: any) => {
    try {
      const response = await notionCentralService.post('/audits', data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Adaptateur pour les méthodes spécifiques aux pages d'échantillon
 */
const samplePagesAdapter = {
  createSamplePage: async (data: any) => {
    try {
      const response = await notionCentralService.post('/sample-pages', data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Adaptateur pour l'ancienne méthode request
 */
const requestAdapter = (endpoint: string, method: string = 'GET', body?: any, token?: string): Promise<any> => {
  console.log(`🔄 Adaptateur de compatibilité - Requête ${method} ${endpoint} redirigée vers le service centralisé`);
  
  return notionCentralService.request({
    endpoint,
    method: method as any,
    body,
    token
  });
};

/**
 * API Notion compatible exportée
 */
export const compatibilityNotionApi = {
  // Sous-ressources organisées
  users: usersAdapter,
  databases: databasesAdapter,
  pages: pagesAdapter,
  
  // Méthodes spécifiques aux projets et audits
  ...projectsAdapter,
  ...auditsAdapter,
  ...samplePagesAdapter,
  
  // Méthode request générique
  request: requestAdapter,
  
  // Expose mockMode pour la compatibilité
  mockMode: mockMode
};

export default compatibilityNotionApi;
