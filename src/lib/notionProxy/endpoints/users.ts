
// Service pour les endpoints "users" de l'API Notion
import { STORAGE_KEYS } from '../config';
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère l'utilisateur courant (me)
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest('/users/me', 'GET', undefined, token);
};

/**
 * Récupère la liste des utilisateurs
 */
export const getUsers = async () => {
  const token = localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
  
  if (!token) {
    throw new Error('Notion API key not found in localStorage');
  }
  
  return notionApiRequest('/users', 'GET', undefined, token);
};

// Add functions needed for the API
export const me = async (apiKey: string) => {
  return notionApiRequest('/users/me', 'GET', undefined, apiKey);
};
