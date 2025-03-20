
import { notionApiRequest } from '../proxyFetch';

/**
 * Recherche des pages ou bases de données dans Notion
 */
export const search = async (searchParams: any, token: string) => {
  return notionApiRequest('/search', 'POST', searchParams, token);
};
