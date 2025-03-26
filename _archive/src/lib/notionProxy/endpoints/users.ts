
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère l'utilisateur actuel
 */
export const me = async (token: string) => {
  return notionApiRequest('/users/me', 'GET', undefined, token);
};

/**
 * Récupère tous les utilisateurs
 */
export const list = async (token: string) => {
  return notionApiRequest('/users', 'GET', undefined, token);
};
