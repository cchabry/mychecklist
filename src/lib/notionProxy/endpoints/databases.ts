
// Service pour les endpoints "databases" de l'API Notion
import { STORAGE_KEYS } from '../config';
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère les détails d'une base de données
 * @param databaseId - Identifiant de la base de données
 */
export const getDatabase = async (databaseId: string) => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest(`/databases/${databaseId}`, 'GET', undefined, token);
};

/**
 * Effectue une requête de type query sur une base de données
 * @param databaseId - Identifiant de la base de données
 * @param queryParams - Paramètres de la requête (filtres, tris, etc.)
 */
export const queryDatabase = async (databaseId: string, queryParams: any) => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest(`/databases/${databaseId}/query`, 'POST', queryParams, token);
};
