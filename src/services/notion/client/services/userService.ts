
/**
 * Service spécifique pour les opérations sur les utilisateurs Notion
 */

import { NotionClient } from '../NotionClient';
import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { NotionUser, NotionListResponse } from '../types';

export function createUserService(client: NotionClient) {
  return {
    /**
     * Récupère l'utilisateur actuel (celui associé au token d'API)
     */
    me: (options?: RequestOptions): Promise<ApiResponse<NotionUser>> => {
      return client.getCurrentUser(options);
    },

    /**
     * Liste tous les utilisateurs accessibles
     */
    list: (options?: RequestOptions): Promise<ApiResponse<NotionListResponse<NotionUser>>> => {
      return client.listUsers(options);
    },

    /**
     * Teste la connexion à l'API Notion et retourne les informations de l'utilisateur
     */
    testConnection: (token?: string, options: RequestOptions = {}): Promise<{ 
      success: boolean; 
      user?: string; 
      error?: string; 
      details?: any 
    }> => {
      // Si un token est fourni, l'ajouter aux options
      const requestOptions = token 
        ? { 
            ...options, 
            headers: { 
              ...options.headers, 
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` 
            } 
          } 
        : options;
      
      return client.testConnection(requestOptions);
    }
  };
}
