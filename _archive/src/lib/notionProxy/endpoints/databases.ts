
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère les infos d'une base de données
 */
export const retrieve = async (databaseId: string, token: string) => {
  return notionApiRequest(`/databases/${databaseId}`, 'GET', undefined, token);
};

/**
 * Exécute une requête sur une base de données
 */
export const query = async (databaseId: string, queryParams: any, token: string) => {
  return notionApiRequest(
    `/databases/${databaseId}/query`,
    'POST',
    queryParams,
    token
  );
};

/**
 * Liste toutes les bases de données
 * Utilise l'endpoint search avec un filtre sur les objets de type database
 */
export const list = async (token: string) => {
  // On utilise explicitement le chemin /v1/search pour garantir la cohérence
  return notionApiRequest(
    '/v1/search',
    'POST',
    {
      filter: {
        value: 'database',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      }
    },
    token
  );
};

/**
 * Crée une base de données dans Notion
 */
export const create = async (pageId: string, data: any, token: string) => {
  return notionApiRequest('/databases', 'POST', {
    parent: { page_id: pageId },
    ...data
  }, token);
};
