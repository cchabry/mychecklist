
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
 */
export const list = async (token: string) => {
  return notionApiRequest('/databases', 'GET', undefined, token);
};
