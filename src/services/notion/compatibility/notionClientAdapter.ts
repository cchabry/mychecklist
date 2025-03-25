
/**
 * Adaptateur de compatibilité pour le client Notion
 * Permet d'utiliser l'ancien client notionApi avec la nouvelle architecture
 */

import { notionApi } from '@/lib/notionProxy';
import { NotionAPIResponse } from '@/lib/types';
import { ConnectionStatus } from '@/hooks/useNotionConnection';

/**
 * Adaptateur qui fournit un wrapper autour de l'ancien notionApi
 * pour le rendre compatible avec la nouvelle architecture
 */
class NotionClientAdapter {
  /**
   * Méthode de proxy pour accéder à databases.query
   */
  public async queryDatabase(databaseId: string, query: any, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).databases?.query === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).databases.query(databaseId, query, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode databases.query n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: queryDatabase');
    }
  }

  /**
   * Méthode de proxy pour accéder à databases.retrieve
   */
  public async retrieveDatabase(databaseId: string, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).databases?.retrieve === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).databases.retrieve(databaseId, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode databases.retrieve n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: retrieveDatabase');
    }
  }

  /**
   * Méthode de proxy pour accéder à pages.retrieve
   */
  public async retrievePage(pageId: string, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).pages?.retrieve === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).pages.retrieve(pageId, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode pages.retrieve n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: retrievePage');
    }
  }

  /**
   * Méthode de proxy pour accéder à pages.update
   */
  public async updatePage(pageId: string, properties: any, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).pages?.update === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).pages.update(pageId, properties, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode pages.update n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: updatePage');
    }
  }

  /**
   * Méthode de proxy pour accéder à pages.create
   */
  public async createPage(parent: any, properties: any, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).pages?.create === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).pages.create(parent, properties, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode pages.create n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: createPage');
    }
  }

  /**
   * Méthode de proxy pour accéder à users.me
   */
  public async me(token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).users?.me === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).users.me(token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode users.me n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: me');
    }
  }

  /**
   * Méthode de proxy pour accéder à users.list
   */
  public async listUsers(token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).users?.list === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).users.list(token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode users.list n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: listUsers');
    }
  }

  /**
   * Méthode de proxy pour accéder à search
   */
  public async search(query: any, token?: string): Promise<any> {
    // Vérifier si la méthode existe sur l'API d'origine
    if (typeof (notionApi as any).search === 'function') {
      // Utiliser la méthode d'origine si elle existe
      return (notionApi as any).search(query, token);
    } else {
      // Implémenter un fallback si l'API d'origine n'a pas cette méthode
      console.warn('La méthode search n\'est pas disponible dans notionApi, utilisation d\'un fallback');
      throw new Error('Méthode non implémentée: search');
    }
  }

  /**
   * Teste la connexion à l'API Notion
   */
  public async testConnection(): Promise<NotionAPIResponse<{ user: string }>> {
    try {
      const response = await notionApi.testConnection();
      
      // Si la réponse ne contient pas la propriété "user", l'ajouter
      if (!response.data || !response.data.user) {
        return {
          ...response,
          data: { 
            ...response.data, 
            user: (response as any).user || 'Unknown User'
          }
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: { user: 'Unknown User' }
      };
    }
  }

  /**
   * Vérifie si le client Notion est configuré
   */
  public isConfigured(): boolean {
    return notionApi.isConfigured();
  }

  /**
   * Configure le client Notion
   */
  public configure(apiKey: string, databaseId: string, checklistsDbId?: string): void {
    notionApi.configure(apiKey, databaseId, checklistsDbId);
  }

  /**
   * Obtient l'état de connexion
   */
  public getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: notionApi.isConfigured(),
      isLoading: false,
      error: null
    };
  }

  /**
   * Définit l'état de connexion (non utilisé, pour compatibilité)
   */
  public setConnectionStatus(status: ConnectionStatus): void {
    // Cette méthode est un placeholder pour compatibilité
    console.log('setConnectionStatus appelé avec:', status);
  }
}

// Créer une instance singleton
export const notionClientAdapter = new NotionClientAdapter();

// Exporter l'instance par défaut
export default notionClientAdapter;
