
import { notionApiRequest } from '../proxyFetch';

export const usersApi = {
  me: async (apiKey?: string) => {
    try {
      return await notionApiRequest('/users/me', {}, apiKey);
    } catch (error) {
      console.error('Échec de la récupération de l\'utilisateur Notion:', error);
      throw error;
    }
  }
};
