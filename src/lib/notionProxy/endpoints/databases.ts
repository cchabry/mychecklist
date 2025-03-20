
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

/**
 * Crée une nouvelle base de données dans Notion
 * @param parentId ID de la page parent où créer la base de données
 * @param title Titre de la base de données
 * @param properties Structure des propriétés de la base de données
 * @param token Token d'authentification Notion
 */
export const create = async (parentId: string, title: string, properties: any, token: string) => {
  const payload = {
    parent: { page_id: parentId },
    title: [{ type: 'text', text: { content: title } }],
    properties
  };
  
  return notionApiRequest('/databases', 'POST', payload, token);
};
