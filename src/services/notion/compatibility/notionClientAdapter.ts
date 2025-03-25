
/**
 * Adaptateur pour assurer la compatibilité avec l'ancien client Notion
 * Permet la transition en douceur vers la nouvelle API
 */

import { notionService } from '../client';
import { NotionAPIResponse, ConnectionStatus, NotionAPIListResponse, NotionAPIPage, NotionAPIError } from '../client/legacy';
import { updateConfig, getStoredConfig } from '../config';

// Service adapté avec toutes les méthodes nécessaires
const adaptedNotionService = {
  ...notionService,
  
  // API Bases de données (ajout)
  databases: {
    query: async (databaseId: string, query = {}): Promise<any> => {
      try {
        if (notionService.databases && typeof notionService.databases.query === 'function') {
          return await notionService.databases.query(databaseId, query);
        }
        throw new Error('Méthode databases.query non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    retrieve: async (databaseId: string): Promise<any> => {
      try {
        if (notionService.databases && typeof notionService.databases.retrieve === 'function') {
          return await notionService.databases.retrieve(databaseId);
        }
        throw new Error('Méthode databases.retrieve non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  },
  
  // API Pages (ajout)
  pages: {
    retrieve: async (pageId: string): Promise<any> => {
      try {
        if (notionService.pages && typeof notionService.pages.retrieve === 'function') {
          return await notionService.pages.retrieve(pageId);
        }
        throw new Error('Méthode pages.retrieve non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    create: async (data: any): Promise<any> => {
      try {
        if (notionService.pages && typeof notionService.pages.create === 'function') {
          return await notionService.pages.create(data);
        }
        throw new Error('Méthode pages.create non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    update: async (pageId: string, data: any): Promise<any> => {
      try {
        if (notionService.pages && typeof notionService.pages.update === 'function') {
          return await notionService.pages.update(pageId, data);
        }
        throw new Error('Méthode pages.update non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  },
  
  // API Utilisateurs (ajout)
  users: {
    me: async (): Promise<any> => {
      try {
        if (notionService.users && typeof notionService.users.me === 'function') {
          return await notionService.users.me();
        }
        throw new Error('Méthode users.me non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    list: async (): Promise<any> => {
      try {
        if (notionService.users && typeof notionService.users.list === 'function') {
          return await notionService.users.list();
        }
        throw new Error('Méthode users.list non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  },
  
  // API Recherche (ajout)
  search: async (query: string, options = {}): Promise<any> => {
    try {
      if (typeof notionService.search === 'function') {
        return await notionService.search(query, options);
      }
      throw new Error('Méthode search non disponible');
    } catch (error) {
      return { 
        success: false, 
        error: { message: error instanceof Error ? error.message : String(error) } 
      };
    }
  },
  
  // Test de connexion enrichi pour la compatibilité
  testConnection: async (): Promise<NotionAPIResponse<{ user: string }>> => {
    try {
      const result = await notionService.testConnection();
      
      return {
        success: result.success,
        data: result.success ? { user: result.user || 'Unknown user' } : undefined,
        error: !result.success ? { 
          message: result.error || 'Unknown error'
        } as NotionAPIError : undefined,
        user: result.success ? result.user || 'Unknown user' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
        }
      };
    }
  }
};

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
  
  // Exporter toutes les méthodes du service adapté
  ...adaptedNotionService
};

export default notionClientAdapter;
