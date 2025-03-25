
/**
 * Adaptateur pour assurer la compatibilité avec l'ancien client Notion
 * Permet la transition en douceur vers la nouvelle API
 */

import { notionService } from '../client';
import { NotionAPIResponse, ConnectionStatus, NotionAPIListResponse, NotionAPIPage } from '../client/legacy';
import { updateConfig, getStoredConfig } from '../config';

// Objet d'adaptateur qui expose l'API compatible avec l'ancien client
export const notionClientAdapter = {
  // Vérification de la configuration
  isConfigured: (): boolean => {
    const config = getStoredConfig();
    return !!config.apiKey && !!config.databaseIds.projects;
  },
  
  // Configuration du client
  configure: (apiKey: string, databaseId: string, checklistsDbId?: string): void => {
    // Adapter les paramètres au nouveau format de configuration
    updateConfig({
      apiKey,
      databaseIds: {
        projects: databaseId,
        checklists: checklistsDbId || null,
        exigences: null,
        pages: null,
        audits: null,
        evaluations: null,
        actions: null,
        progress: null
      }
    });
    
    console.log('✅ Notion configuration updated via compatibility adapter');
  },
  
  // Test de connexion
  testConnection: async (): Promise<NotionAPIResponse<{ user: string }>> => {
    try {
      const result = await notionService.users.testConnection();
      
      return {
        success: result.success,
        data: result.success ? { user: result.user || 'Unknown user' } : undefined,
        error: !result.success ? { message: result.error || 'Unknown error' } : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Une erreur inconnue est survenue'
        }
      };
    }
  },
  
  // Gestion de l'état de connexion
  getConnectionStatus: (): ConnectionStatus => {
    // Obtenir le statut depuis le service principal
    const { client } = notionService;
    return client._connectionStatus || ConnectionStatus.Disconnected;
  },
  
  setConnectionStatus: (status: ConnectionStatus): void => {
    // Définir le statut dans le service principal
    const { client } = notionService;
    client._connectionStatus = status;
  },
  
  // Proxy pour les opérations de l'API Notion (databases, users, pages, etc.)
  databases: {
    query: async (databaseId: string, query = {}): Promise<NotionAPIResponse<NotionAPIListResponse>> => {
      try {
        const { client } = notionService;
        const result = await client.databases.query(databaseId, query);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    },
    
    retrieve: async (databaseId: string): Promise<NotionAPIResponse<any>> => {
      try {
        const { client } = notionService;
        const result = await client.databases.retrieve(databaseId);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    }
  },
  
  pages: {
    retrieve: async (pageId: string): Promise<NotionAPIResponse<NotionAPIPage>> => {
      try {
        const { client } = notionService;
        const result = await client.pages.retrieve(pageId);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    },
    
    create: async (data: any): Promise<NotionAPIResponse<NotionAPIPage>> => {
      try {
        const { client } = notionService;
        const result = await client.pages.create(data);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    },
    
    update: async (pageId: string, data: any): Promise<NotionAPIResponse<NotionAPIPage>> => {
      try {
        const { client } = notionService;
        const result = await client.pages.update(pageId, data);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    }
  },
  
  users: {
    me: async (): Promise<NotionAPIResponse<any>> => {
      try {
        const result = await notionService.users.me();
        return { success: true, data: result.data };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    },
    
    list: async (): Promise<NotionAPIResponse<NotionAPIListResponse>> => {
      try {
        const result = await notionService.users.list();
        return { success: true, data: result.data };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    }
  },
  
  search: async (query: string, options = {}): Promise<NotionAPIResponse<NotionAPIListResponse>> => {
    try {
      const result = await notionService.search.search(query, options);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: { message: error.message } };
    }
  }
};

export default notionClientAdapter;
