
import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { Audit } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupère tous les audits
 */
export const getAudits = async (): Promise<Audit[]> => {
  // Si nous sommes en mode démo, retourner des données simulées
  if (operationMode.isDemoMode) {
    console.log('Using demo audits data');
    return [
      {
        id: uuidv4(), // Utiliser un UUID standard
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
  const dbId = localStorage.getItem('notion_audit_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
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
    // Générer un UUID standard pour l'ID, même en mode démo
    // pour assurer la cohérence entre les modes
    const id = uuidv4();
    return {
      id: id, // UUID standard sans préfixe
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
  const dbId = localStorage.getItem('notion_audit_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "Name": { title: [{ text: { content: data.name || `Audit du ${new Date().toLocaleDateString()}` } }] },
    "ProjectId": { rich_text: [{ text: { content: data.projectId || '' } }] },
    "Score": { number: 0 },
    "Version": { rich_text: [{ text: { content: '1.0' } }] }
  };
  
  console.log('Création d\'audit dans Notion avec les propriétés:', JSON.stringify(properties));
  
  try {
    const response = await notionApiRequest(
      `/pages`,
      'POST',
      {
        parent: { database_id: dbId },
        properties
      },
      apiKey
    );

    console.log('Réponse de création d\'audit:', JSON.stringify(response));
    
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
    console.error('Erreur lors de la création de l\'audit:', error);
    // En cas d'échec avec l'API, revenir au mode démo pour cet audit
    const id = uuidv4();
    console.log('Création d\'un audit de secours avec UUID standard:', id);
    return {
      id: id,
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      version: '1.0'
    };
  }
};

/**
 * Met à jour un audit existant
 */
export const updateAudit = async (id: string, data: Partial<Audit>): Promise<Audit> => {
  // Nettoyer l'ID si nécessaire (retirer les préfixes)
  let cleanId = id;
  if (id.startsWith('audit_') || id.startsWith('audit-')) {
    const match = id.match(/(?:audit_|audit-)(.+)/);
    if (match && match[1]) {
      cleanId = match[1];
      console.log(`ID d'audit nettoyé pour mise à jour: ${id} -> ${cleanId}`);
    }
  }

  // Si nous sommes en mode démo, mettre à jour un faux audit
  if (operationMode.isDemoMode) {
    console.log('Updating demo audit with ID:', cleanId);
    return {
      id: cleanId,
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
    `/pages/${cleanId}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer l'audit mis à jour
  const updatedAudit = await getAudit(cleanId);
  return updatedAudit || {
    id: cleanId,
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
  // Nettoyer l'ID si nécessaire
  let cleanId = id;
  if (id.startsWith('audit_') || id.startsWith('audit-')) {
    const match = id.match(/(?:audit_|audit-)(.+)/);
    if (match && match[1]) {
      cleanId = match[1];
      console.log(`ID d'audit nettoyé pour suppression: ${id} -> ${cleanId}`);
    }
  }

  // Si nous sommes en mode démo, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting demo audit with ID:', cleanId);
    return true;
  }

  // Sinon, supprimer dans Notion (Notion archive les pages, ne les supprime pas vraiment)
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    await notionApiRequest(
      `/pages/${cleanId}`,
      'PATCH',
      {
        archived: true
      },
      apiKey
    );
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'audit #${cleanId}:`, error);
    return false;
  }
};

/**
 * Récupère un audit par son ID
 */
export const getAudit = async (id: string): Promise<Audit | null> => {
  // Nettoyer l'ID si nécessaire
  let cleanId = id;
  if (id.startsWith('audit_') || id.startsWith('audit-')) {
    console.warn('ID d\'audit avec préfixe détecté, nettoyage pour l\'API Notion:', id);
    const match = id.match(/(?:audit_|audit-)(.+)/);
    if (match && match[1]) {
      cleanId = match[1];
      console.log(`ID d'audit nettoyé: ${id} -> ${cleanId}`);
    }
  }
  
  // Si nous sommes en mode démo, retourner un faux audit
  if (operationMode.isDemoMode) {
    console.log('Using demo audit data for ID:', cleanId);
    return {
      id: cleanId,
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
      `/pages/${cleanId}`,
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
    console.error(`Erreur lors de la récupération de l'audit #${cleanId}:`, error);
    return null;
  }
};
