
import { notionApiRequest } from '../proxyFetch';

export const pagesApi = {
  retrieve: async (pageId: string, apiKey?: string) => {
    try {
      return await notionApiRequest(`/pages/${pageId}`, {}, apiKey);
    } catch (error) {
      console.error(`Échec de la récupération de la page Notion ${pageId}:`, error);
      throw error;
    }
  },
  
  create: async (params: any, apiKey?: string) => {
    try {
      return await notionApiRequest('/pages', {
        method: 'POST',
        body: JSON.stringify(params)
      }, apiKey);
    } catch (error) {
      console.error('Échec de la création de la page Notion:', error);
      throw error;
    }
  },
  
  update: async (pageId: string, params: any, apiKey?: string) => {
    try {
      return await notionApiRequest(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(params)
      }, apiKey);
    } catch (error) {
      console.error(`Échec de la mise à jour de la page Notion ${pageId}:`, error);
      throw error;
    }
  }
};
