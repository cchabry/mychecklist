
/**
 * Service spécifique pour les opérations sur les bases de données Notion
 */

import { NotionClient } from '../NotionClient';
import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { 
  NotionDatabase, 
  NotionPage, 
  NotionListResponse,
  DatabaseQueryParams 
} from '../types';

export function createDatabaseService(client: NotionClient) {
  return {
    /**
     * Récupère une base de données par son ID
     */
    get: (databaseId: string, options?: RequestOptions): Promise<ApiResponse<NotionDatabase>> => {
      return client.getDatabase(databaseId, options);
    },

    /**
     * Interroge une base de données pour récupérer ses enregistrements
     */
    query: (
      databaseId: string, 
      params?: DatabaseQueryParams, 
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionPage>>> => {
      return client.queryDatabase(databaseId, params, options);
    },

    /**
     * Crée une nouvelle base de données
     */
    create: (
      parentPageId: string,
      title: string,
      properties: Record<string, any>,
      options?: RequestOptions
    ): Promise<ApiResponse<NotionDatabase>> => {
      // Formater le titre au format Notion
      const formattedTitle = [{
        type: 'text',
        text: { content: title }
      }];
      
      return client.createDatabase(
        {
          parent: { page_id: parentPageId },
          title: formattedTitle,
          properties
        },
        options
      );
    },

    /**
     * Liste toutes les bases de données accessibles
     * Utilise l'API search avec un filtre
     */
    list: (options?: RequestOptions) => {
      return client.search(
        {
          filter: {
            property: 'object',
            value: 'database'
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time'
          }
        },
        options
      );
    }
  };
}
