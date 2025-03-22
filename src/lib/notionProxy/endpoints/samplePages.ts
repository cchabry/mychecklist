
import { notionApiRequest } from '../proxyFetch';
import { mockMode } from '../mockMode';
import { SamplePage } from '@/lib/types';

/**
 * Récupère toutes les pages d'échantillon
 */
export const getSamplePages = async (): Promise<SamplePage[]> => {
  // Si nous sommes en mode mock, retourner des données mock
  if (mockMode.isActive()) {
    console.log('Using mock sample pages data');
    return [
      {
        id: 'page-1',
        projectId: 'project-1',
        url: 'https://example.com/page1',
        title: 'Page d\'accueil',
        description: 'Page principale du site',
        order: 0
      },
      {
        id: 'page-2',
        projectId: 'project-1',
        url: 'https://example.com/page2',
        title: 'Page de contact',
        description: 'Formulaire de contact',
        order: 1
      }
    ];
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_samplepages_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en pages d'échantillon
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
      url: properties.URL?.url || properties.Url?.url || '',
      title: properties.Title?.title?.[0]?.plain_text || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || '',
      order: properties.Order?.number || 0
    };
  });
};

/**
 * Récupère une page d'échantillon par son ID
 */
export const getSamplePage = async (id: string): Promise<SamplePage | null> => {
  // Si nous sommes en mode mock, retourner une fausse page
  if (mockMode.isActive()) {
    console.log('Using mock sample page data for ID:', id);
    return {
      id,
      projectId: 'project-1',
      url: 'https://example.com/page',
      title: 'Page d\'exemple',
      description: 'Description de la page',
      order: 0
    };
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    const response = await notionApiRequest(
      `/pages/${id}`,
      'GET',
      undefined,
      apiKey
    );

    if (!response) {
      return null;
    }

    const properties = response.properties;
    
    return {
      id: response.id,
      projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
      url: properties.URL?.url || properties.Url?.url || '',
      title: properties.Title?.title?.[0]?.plain_text || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || '',
      order: properties.Order?.number || 0
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de la page d'échantillon #${id}:`, error);
    return null;
  }
};

/**
 * Crée une nouvelle page d'échantillon
 */
export const createSamplePage = async (data: Partial<SamplePage>): Promise<SamplePage> => {
  // Si nous sommes en mode mock, créer une fausse page
  if (mockMode.isActive()) {
    console.log('Creating mock sample page for project:', data.projectId);
    return {
      id: `page-${Date.now()}`,
      projectId: data.projectId || '',
      url: data.url || '',
      title: data.title || '',
      description: data.description || '',
      order: data.order || 0
    };
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_samplepages_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "ProjectId": { rich_text: [{ text: { content: data.projectId || '' } }] },
    "URL": { url: data.url || '' },
    "Title": { title: [{ text: { content: data.title || '' } }] },
    "Description": { rich_text: [{ text: { content: data.description || '' } }] },
    "Order": { number: data.order || 0 }
  };
  
  const response = await notionApiRequest(
    `/pages`,
    'POST',
    {
      parent: { database_id: dbId },
      properties
    },
    apiKey
  );

  return {
    id: response.id,
    projectId: data.projectId || '',
    url: data.url || '',
    title: data.title || '',
    description: data.description || '',
    order: data.order || 0
  };
};

/**
 * Met à jour une page d'échantillon existante
 */
export const updateSamplePage = async (id: string, data: Partial<SamplePage>): Promise<SamplePage> => {
  // Si nous sommes en mode mock, mettre à jour une fausse page
  if (mockMode.isActive()) {
    console.log('Updating mock sample page with ID:', id);
    return {
      id,
      projectId: data.projectId || '',
      url: data.url || '',
      title: data.title || '',
      description: data.description || '',
      order: data.order || 0
    };
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties: any = {};
  
  if (data.url) {
    properties.URL = { url: data.url };
  }
  
  if (data.title) {
    properties.Title = { title: [{ text: { content: data.title } }] };
  }
  
  if (data.description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: data.description } }] };
  }
  
  if (data.order !== undefined) {
    properties.Order = { number: data.order };
  }
  
  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer la page mise à jour
  const updatedPage = await getSamplePage(id);
  return updatedPage || {
    id,
    projectId: data.projectId || '',
    url: data.url || '',
    title: data.title || '',
    description: data.description || '',
    order: data.order || 0
  };
};

/**
 * Supprime une page d'échantillon
 */
export const deleteSamplePage = async (id: string): Promise<boolean> => {
  // Si nous sommes en mode mock, simuler une suppression
  if (mockMode.isActive()) {
    console.log('Deleting mock sample page with ID:', id);
    return true;
  }

  // Sinon, supprimer dans Notion (Notion archive les pages, ne les supprime pas vraiment)
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    await notionApiRequest(
      `/pages/${id}`,
      'PATCH',
      {
        archived: true
      },
      apiKey
    );
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page d'échantillon #${id}:`, error);
    return false;
  }
};
