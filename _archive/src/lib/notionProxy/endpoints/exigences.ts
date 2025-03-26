
import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { Exigence, ImportanceLevel } from '@/lib/types';

/**
 * Récupère toutes les exigences
 */
export const getExigences = async (): Promise<Exigence[]> => {
  // Si nous sommes en mode démo, retourner des données simulées
  if (operationMode.isDemoMode) {
    console.log('Using demo exigences data');
    return [
      {
        id: 'exigence-1',
        projectId: 'project-1',
        itemId: 'item-1',
        importance: ImportanceLevel.Important,
        comment: 'Exigence test'
      }
    ];
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_exigences_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en exigences
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
      itemId: properties.ItemId?.rich_text?.[0]?.plain_text || '',
      importance: properties.Importance?.select?.name as ImportanceLevel || ImportanceLevel.NA,
      comment: properties.Comment?.rich_text?.[0]?.plain_text || ''
    };
  });
};

/**
 * Récupère une exigence par son ID
 */
export const getExigence = async (id: string): Promise<Exigence | null> => {
  // Si nous sommes en mode démo, retourner une fausse exigence
  if (operationMode.isDemoMode) {
    console.log('Using demo exigence data for ID:', id);
    return {
      id,
      projectId: 'project-1',
      itemId: 'item-1',
      importance: ImportanceLevel.Important,
      comment: 'Exigence test'
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
      itemId: properties.ItemId?.rich_text?.[0]?.plain_text || '',
      importance: properties.Importance?.select?.name as ImportanceLevel || ImportanceLevel.NA,
      comment: properties.Comment?.rich_text?.[0]?.plain_text || ''
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'exigence #${id}:`, error);
    return null;
  }
};

/**
 * Crée une nouvelle exigence
 */
export const createExigence = async (data: Partial<Exigence>): Promise<Exigence> => {
  // Si nous sommes en mode démo, créer une fausse exigence
  if (operationMode.isDemoMode) {
    console.log('Creating demo exigence for project:', data.projectId);
    return {
      id: `exigence-${Date.now()}`,
      projectId: data.projectId || '',
      itemId: data.itemId || '',
      importance: data.importance || ImportanceLevel.NA,
      comment: data.comment || ''
    };
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_exigences_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "ProjectId": { rich_text: [{ text: { content: data.projectId || '' } }] },
    "ItemId": { rich_text: [{ text: { content: data.itemId || '' } }] },
    "Importance": { select: { name: data.importance || ImportanceLevel.NA } },
    "Comment": { rich_text: [{ text: { content: data.comment || '' } }] }
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
    itemId: data.itemId || '',
    importance: data.importance || ImportanceLevel.NA,
    comment: data.comment || ''
  };
};

/**
 * Met à jour une exigence existante
 */
export const updateExigence = async (id: string, data: Partial<Exigence>): Promise<Exigence> => {
  // Si nous sommes en mode démo, mettre à jour une fausse exigence
  if (operationMode.isDemoMode) {
    console.log('Updating demo exigence with ID:', id);
    return {
      id,
      projectId: data.projectId || '',
      itemId: data.itemId || '',
      importance: data.importance || ImportanceLevel.NA,
      comment: data.comment || ''
    };
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties: any = {};
  
  if (data.importance) {
    properties.Importance = { select: { name: data.importance } };
  }
  
  if (data.comment !== undefined) {
    properties.Comment = { rich_text: [{ text: { content: data.comment } }] };
  }
  
  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer l'exigence mise à jour
  const updatedExigence = await getExigence(id);
  return updatedExigence || {
    id,
    projectId: data.projectId || '',
    itemId: data.itemId || '',
    importance: data.importance || ImportanceLevel.NA,
    comment: data.comment || ''
  };
};

/**
 * Supprime une exigence
 */
export const deleteExigence = async (id: string): Promise<boolean> => {
  // Si nous sommes en mode démo, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting demo exigence with ID:', id);
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
    console.error(`Erreur lors de la suppression de l'exigence #${id}:`, error);
    return false;
  }
};
