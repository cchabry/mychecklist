
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
  console.log('Création de page Notion via proxy:', JSON.stringify(data, null, 2));
  
  // Nettoyer les propriétés pour éviter les erreurs d'API
  if (data && data.properties) {
    // S'assurer que les propriétés standard avec noms capitalisés sont présentes
    if (!data.properties.Name && data.properties.name) {
      data.properties.Name = data.properties.name;
    }
    
    if (!data.properties.URL && data.properties.url) {
      data.properties.URL = data.properties.url;
    }
    
    // S'assurer que les propriétés de titre sont correctement formatées
    if (data.properties.Name && data.properties.Name.title) {
      data.properties.Name.title = data.properties.Name.title.map((item: any) => {
        if (typeof item.text === 'string') {
          return { text: { content: item.text } };
        }
        return item;
      });
    }
  }
  
  // Appel de l'API Notion
  try {
    const response = await notionApiRequest('/pages', 'POST', data, token);
    console.log('Réponse de création de page:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Erreur lors de la création de page Notion:', error);
    throw error;
  }
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
