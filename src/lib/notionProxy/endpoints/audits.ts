import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { Audit } from '@/lib/types';

/**
 * Récupère tous les audits
 */
export const getAudits = async (): Promise<Audit[]> => {
  // Si nous sommes en mode démo, retourner des données simulées
  if (operationMode.isDemoMode) {
    console.log('Using demo audits data');
    return [
      {
        id: 'audit-1',
        projectId: 'project-1',
        name: 'Audit initial',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 75,
        version: '1.0'
      }
    ];
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_audits_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante pour les audits');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en audits
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
      name: properties.Name?.title?.[0]?.plain_text || 'Audit sans nom',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      score: properties.Score?.number || 0,
      items: [],
      version: properties.Version?.rich_text?.[0]?.plain_text || '1.0'
    };
  });
};

/**
 * Crée un nouvel audit
 */
export const createAudit = async (data: Partial<Audit>): Promise<Audit> => {
  // Si nous sommes en mode démo, créer un faux audit
  if (operationMode.isDemoMode) {
    console.log('Creating demo audit with name:', data.name);
    return {
      id: `audit-${Date.now()}`,
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      version: '1.0'
    };
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_audits_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante pour les audits');
  }

  console.log(`Création d'un audit dans Notion avec apiKey: ${apiKey.slice(0, 5)}... et dbId: ${dbId}`);

  try {
    const properties = {
      "Name": { title: [{ text: { content: data.name || `Audit du ${new Date().toLocaleDateString()}` } }] },
      "ProjectId": { rich_text: [{ text: { content: data.projectId || '' } }] },
      "Score": { number: 0 },
      "Version": { rich_text: [{ text: { content: '1.0' } }] }
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

    console.log('Réponse de création d\'audit Notion:', response);

    return {
      id: response.id,
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      score: 0,
      version: '1.0'
    };
  } catch (error) {
    console.error('Erreur lors de la création d\'un audit dans Notion:', error);
    console.error('Détails:', error.message, error.stack);
    
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response);
    }
    
    // Reformater le message d'erreur pour être plus informatif
    const errorMessage = error.message.includes('Failed to fetch') 
      ? 'Erreur de connexion à l\'API Notion (CORS)'
      : `Erreur de création d'audit: ${error.message}`;
    
    throw new Error(errorMessage);
  }
};

/**
 * Met à jour un audit existant
 */
export const updateAudit = async (id: string, data: Partial<Audit>): Promise<Audit> => {
  // Si nous sommes en mode démo, mettre à jour un faux audit
  if (operationMode.isDemoMode) {
    console.log('Updating demo audit with ID:', id);
    return {
      id,
      projectId: data.projectId || '',
      name: data.name || `Audit mis à jour`,
      items: data.items || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: data.score || 0,
      version: data.version || '1.0'
    };
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties: any = {};
  
  if (data.name) {
    properties.Name = { title: [{ text: { content: data.name } }] };
  }
  
  if (data.score !== undefined) {
    properties.Score = { number: data.score };
  }
  
  if (data.version) {
    properties.Version = { rich_text: [{ text: { content: data.version } }] };
  }
  
  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer l'audit mis à jour
  const updatedAudit = await getAudit(id);
  return updatedAudit || {
    id,
    projectId: data.projectId || '',
    name: data.name || '',
    items: data.items || [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: data.score || 0,
    version: data.version || '1.0'
  };
};

/**
 * Supprime un audit
 */
export const deleteAudit = async (id: string): Promise<boolean> => {
  // Si nous sommes en mode démo, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting demo audit with ID:', id);
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
    console.error(`Erreur lors de la suppression de l'audit #${id}:`, error);
    return false;
  }
};

/**
 * Récupère un audit par son ID (déjà implémenté dans projects.ts, mais ajouté ici pour compléter)
 */
export const getAudit = async (id: string): Promise<Audit | null> => {
  // Si nous sommes en mode démo, retourner un faux audit
  if (operationMode.isDemoMode) {
    console.log('Using demo audit data for ID:', id);
    return {
      id,
      name: `Audit de test`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 65,
      items: [],
      projectId: 'project-1234',
      version: '1.0'
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
      name: properties.Name?.title?.[0]?.plain_text || `Audit sans nom`,
      projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || '',
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      score: properties.Score?.number || 0,
      items: [],
      version: properties.Version?.rich_text?.[0]?.plain_text || '1.0'
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'audit #${id}:`, error);
    return null;
  }
};

