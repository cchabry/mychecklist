
// Service pour les endpoints "pages" de l'API Notion
import { STORAGE_KEYS } from '../config';
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère les détails d'une page
 * @param pageId - Identifiant de la page
 */
export const getPage = async (pageId: string) => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest(`/pages/${pageId}`, 'GET', undefined, token);
};

/**
 * Crée une nouvelle page dans une base de données
 * @param databaseId - Identifiant de la base de données parent
 * @param properties - Propriétés de la page à créer
 */
export const createPage = async (databaseId: string, properties: any) => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  const body = {
    parent: { database_id: databaseId },
    properties
  };
  
  return notionApiRequest('/pages', 'POST', body, token);
};

/**
 * Met à jour une page existante
 * @param pageId - Identifiant de la page à mettre à jour
 * @param properties - Propriétés à mettre à jour
 */
export const updatePage = async (pageId: string, properties: any) => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest(`/pages/${pageId}`, 'PATCH', { properties }, token);
};

// Add functions needed for the API
export const retrieve = async (pageId: string, apiKey: string) => {
  return notionApiRequest(`/pages/${pageId}`, 'GET', undefined, apiKey);
};

export const create = async (data: any, apiKey: string) => {
  return notionApiRequest('/pages', 'POST', data, apiKey);
};

export const update = async (pageId: string, data: any, apiKey: string) => {
  return notionApiRequest(`/pages/${pageId}`, 'PATCH', data, apiKey);
};
