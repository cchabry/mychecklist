
/**
 * Service spécifique pour les opérations de recherche Notion
 */

import { NotionClient } from '../NotionClient';
import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { 
  NotionPage, 
  NotionDatabase, 
  NotionListResponse,
  SearchParams 
} from '../types';

export function createSearchService(client: NotionClient) {
  return {
    /**
     * Effectue une recherche dans l'espace de travail Notion
     */
    query: (
      params: SearchParams = {},
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionPage | NotionDatabase>>> => {
      return client.search(params, options);
    },
    
    /**
     * Recherche avec un texte simple
     */
    text: (
      query: string,
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionPage | NotionDatabase>>> => {
      return client.search({ query }, options);
    },
    
    /**
     * Recherche spécifiquement des bases de données
     */
    databases: (
      query?: string,
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionDatabase>>> => {
      return client.search({
        query,
        filter: {
          property: 'object',
          value: 'database'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      }, options) as Promise<ApiResponse<NotionListResponse<NotionDatabase>>>;
    },
    
    /**
     * Recherche spécifiquement des pages
     */
    pages: (
      query?: string,
      options?: RequestOptions
    ): Promise<ApiResponse<NotionListResponse<NotionPage>>> => {
      return client.search({
        query,
        filter: {
          property: 'object',
          value: 'page'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      }, options) as Promise<ApiResponse<NotionListResponse<NotionPage>>>;
    }
  };
}
