
/**
 * Service Notion complet avec une API métier
 * Construit sur le client Notion de bas niveau
 */

import { NotionClient } from './NotionClient';
import { ConnectionStatus, NotionAPIResponse } from './legacy';

/**
 * Service qui expose les fonctionnalités Notion
 */
export function createNotionService() {
  // Créer une instance du client
  const client = new NotionClient({
    debug: process.env.NODE_ENV === 'development'
  });
  
  // État interne de la connexion
  let connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected;
  
  // Service complet avec API métier
  return {
    // Expose le client de base
    client,
    
    // Getters/Setters pour l'état de connexion
    get connectionStatus() {
      return connectionStatus;
    },
    
    set connectionStatus(status: ConnectionStatus) {
      connectionStatus = status;
    },
    
    // Configuration
    isConfigured: (): boolean => {
      return client.isConfigured();
    },
    
    configure: (apiKey: string, databaseId: string, checklistsDbId?: string): void => {
      // Stockage de la configuration
      localStorage.setItem('notion_api_key', apiKey);
      localStorage.setItem('notion_database_id', databaseId);
      
      if (checklistsDbId) {
        localStorage.setItem('notion_checklists_database_id', checklistsDbId);
      }
      
      // Mise à jour de l'état de connexion
      connectionStatus = ConnectionStatus.Connected;
    },
    
    // Test de la connexion
    testConnection: async (): Promise<NotionAPIResponse<{ user: string }>> => {
      try {
        const result = await client.testConnection();
        
        connectionStatus = result.success ? 
          ConnectionStatus.Connected : 
          ConnectionStatus.Error;
          
        return {
          success: result.success,
          data: result.success ? { user: result.user || 'Unknown' } : undefined,
          error: !result.success ? { message: result.error || 'Unknown error' } : undefined,
          user: result.success ? result.user || 'Unknown' : undefined
        };
      } catch (error) {
        connectionStatus = ConnectionStatus.Error;
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
          }
        };
      }
    },
    
    // Récupérer l'état de connexion
    getConnectionStatus: (): ConnectionStatus => {
      return connectionStatus;
    },
    
    // Définir l'état de connexion
    setConnectionStatus: (status: ConnectionStatus): void => {
      connectionStatus = status;
    },
    
    // API Utilisateurs
    users: {
      me: async () => {
        try {
          const response = await client.getCurrentUser();
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      },
      
      list: async () => {
        try {
          const response = await client.listUsers();
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      }
    },
    
    // API Bases de données
    databases: {
      retrieve: async (databaseId: string) => {
        try {
          const response = await client.getDatabase(databaseId);
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      },
      
      query: async (databaseId: string, query = {}) => {
        try {
          const response = await client.queryDatabase(databaseId, query);
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      }
    },
    
    // API Pages
    pages: {
      retrieve: async (pageId: string) => {
        try {
          const response = await client.getPage(pageId);
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      },
      
      create: async (data: any) => {
        try {
          const response = await client.createPage(data);
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      },
      
      update: async (pageId: string, data: any) => {
        try {
          const response = await client.updatePage(pageId, data);
          return { success: true, data: response.data };
        } catch (error) {
          return { 
            success: false, 
            error: { message: error instanceof Error ? error.message : String(error) } 
          };
        }
      }
    },
    
    // API Recherche
    search: async (query: string, options = {}) => {
      try {
        const response = await client.search({
          query,
          ...options
        });
        return { success: true, data: response.data };
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  };
}
