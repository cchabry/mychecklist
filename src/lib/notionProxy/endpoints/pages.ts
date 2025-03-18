
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère une page par son ID
 */
export const retrieve = async (pageId: string, token: string) => {
  return notionApiRequest(`/pages/${pageId}`, 'GET', undefined, token);
};

/**
 * Crée une nouvelle page
 */
export const create = async (data: any, token: string) => {
  return notionApiRequest('/pages', 'POST', data, token);
};

/**
 * Met à jour une page existante
 */
export const update = async (pageId: string, properties: any, token: string) => {
  return notionApiRequest(
    `/pages/${pageId}`, 
    'PATCH', 
    properties,
    token
  );
};
