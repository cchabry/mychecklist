
import { notionApiRequest } from '../proxyFetch';

export const databasesApi = {
  query: async (databaseId: string, params: any = {}, apiKey?: string) => {
    try {
      // S'assurer que l'ID de la base de données est propre
      const cleanId = databaseId.replace(/-/g, '');
      return await notionApiRequest(`/databases/${cleanId}/query`, {
        method: 'POST',
        body: JSON.stringify(params)
      }, apiKey);
    } catch (error) {
      console.error(`Échec de la requête à la base de données Notion ${databaseId}:`, error);
      throw error;
    }
  },
  
  retrieve: async (databaseId: string, apiKey?: string) => {
    try {
      // S'assurer que l'ID de la base de données est propre
      const cleanId = databaseId.replace(/-/g, '');
      return await notionApiRequest(`/databases/${cleanId}`, {}, apiKey);
    } catch (error) {
      console.error(`Échec de la récupération de la base de données Notion ${databaseId}:`, error);
      throw error;
    }
  }
};
