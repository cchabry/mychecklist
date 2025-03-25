
/**
 * Service spécifique pour les opérations sur les pages Notion
 */

import { NotionClient } from '../NotionClient';
import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { 
  NotionPage, 
  NotionBlock, 
  NotionListResponse 
} from '../types';

export function createPageService(client: NotionClient) {
  return {
    /**
     * Récupère une page par son ID
     */
    get: (pageId: string, options?: RequestOptions): Promise<ApiResponse<NotionPage>> => {
      return client.getPage(pageId, options);
    },

    /**
     * Crée une nouvelle page dans une base de données
     */
    createInDatabase: (
      databaseId: string,
      properties: Record<string, any>,
      children?: any[],
      options?: RequestOptions
    ): Promise<ApiResponse<NotionPage>> => {
      return client.createPage(
        {
          parent: { database_id: databaseId },
          properties,
          ...(children ? { children } : {})
        },
        options
      );
    },

    /**
     * Crée une nouvelle page sous une page existante
     */
    createSubpage: (
      parentPageId: string,
      title: string,
      children?: any[],
      options?: RequestOptions
    ): Promise<ApiResponse<NotionPage>> => {
      // Pour les sous-pages, le titre est une propriété spéciale
      const properties = {
        title: {
          title: [
            {
              type: 'text',
              text: { content: title }
            }
          ]
        }
      };
      
      return client.createPage(
        {
          parent: { page_id: parentPageId },
          properties,
          ...(children ? { children } : {})
        },
        options
      );
    },

    /**
     * Met à jour les propriétés d'une page
     */
    update: (
      pageId: string,
      properties: Record<string, any>,
      options?: RequestOptions
    ): Promise<ApiResponse<NotionPage>> => {
      return client.updatePage(pageId, { properties }, options);
    },

    /**
     * Archive une page (suppression douce)
     */
    archive: (pageId: string, options?: RequestOptions): Promise<ApiResponse<NotionPage>> => {
      return client.updatePage(pageId, { archived: true }, options);
    },

    /**
     * Désarchive une page
     */
    unarchive: (pageId: string, options?: RequestOptions): Promise<ApiResponse<NotionPage>> => {
      return client.updatePage(pageId, { archived: false }, options);
    },

    /**
     * Récupère les blocs enfants d'une page
     */
    getContent: (
      pageId: string, 
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionBlock>>> => {
      return client.getBlockChildren(pageId, options);
    },

    /**
     * Ajoute du contenu à une page
     */
    addContent: (
      pageId: string,
      blocks: any[],
      options?: RequestOptions
    ): Promise<ApiResponse<{ results: NotionBlock[] }>> => {
      return client.appendBlockChildren(pageId, blocks, options);
    }
  };
}
