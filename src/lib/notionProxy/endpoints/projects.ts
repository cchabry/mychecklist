
import { notionApiRequest } from '../proxyFetch';
import { mockMode } from '../mockMode';
import { MOCK_PROJECTS } from '../../mockData';

/**
 * Récupère tous les projets
 */
export const getProjects = async () => {
  // Si nous sommes en mode mock, retourner les données mock
  if (mockMode.isActive()) {
    console.log('Using mock projects data');
    return MOCK_PROJECTS;
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en projets
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      name: properties.Name?.title?.[0]?.plain_text || 
            properties.name?.title?.[0]?.plain_text || 'Sans titre',
      url: properties.URL?.url || 
           properties.url?.url || 
           properties.Url?.url || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || 
                   properties.description?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name || 
              properties.status?.select?.name || 'Non démarré',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      progress: properties.Progress?.number || 
                properties.progress?.number || 0,
      itemsCount: properties.ItemsCount?.number || 
                  properties.itemsCount?.number ||
                  properties.Nombre?.number || 15
    };
  });
};

/**
 * Récupère un projet par son ID
 */
export const getProject = async (id: string) => {
  // Si nous sommes en mode mock, retourner les données mock
  if (mockMode.isActive()) {
    console.log('Using mock project data for ID:', id);
    return MOCK_PROJECTS.find(project => project.id === id) || null;
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

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
    name: properties.Name?.title?.[0]?.plain_text || 
          properties.name?.title?.[0]?.plain_text || 'Sans titre',
    url: properties.URL?.url || 
         properties.url?.url || 
         properties.Url?.url || '',
    description: properties.Description?.rich_text?.[0]?.plain_text || 
                 properties.description?.rich_text?.[0]?.plain_text || '',
    status: properties.Status?.select?.name || 
            properties.status?.select?.name || 'Non démarré',
    createdAt: response.created_time,
    updatedAt: response.last_edited_time,
    progress: properties.Progress?.number || 
              properties.progress?.number || 0,
    itemsCount: properties.ItemsCount?.number || 
                properties.itemsCount?.number ||
                properties.Nombre?.number || 15
  };
};

/**
 * Crée un nouveau projet
 */
export const createProject = async (data: { name: string; url: string }) => {
  // Si nous sommes en mode mock, créer un faux projet
  if (mockMode.isActive()) {
    console.log('Creating mock project with name:', data.name);
    const newProject = {
      id: `project-${Date.now()}`,
      name: data.name,
      url: data.url,
      description: 'Projet créé en mode démonstration',
      status: 'Non démarré',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      itemsCount: 15
    };
    
    // Ajouter aux projets mock pour cohérence
    MOCK_PROJECTS.unshift(newProject);
    
    return newProject;
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "Name": { title: [{ text: { content: data.name } }] },
    "URL": { url: data.url },
    "Description": { rich_text: [{ text: { content: 'Projet créé via l\'application' } }] },
    "Status": { select: { name: 'Non démarré' } },
    "Progress": { number: 0 },
    "ItemsCount": { number: 15 }
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
    name: data.name,
    url: data.url,
    description: 'Projet créé via l\'application',
    status: 'Non démarré',
    createdAt: response.created_time,
    updatedAt: response.last_edited_time,
    progress: 0,
    itemsCount: 15
  };
};

/**
 * Met à jour un projet existant
 */
export const updateProject = async (id: string, data: { name: string; url: string }) => {
  // Si nous sommes en mode mock, mettre à jour un faux projet
  if (mockMode.isActive()) {
    console.log('Updating mock project with ID:', id);
    const projectIndex = MOCK_PROJECTS.findIndex(project => project.id === id);
    
    if (projectIndex !== -1) {
      MOCK_PROJECTS[projectIndex] = {
        ...MOCK_PROJECTS[projectIndex],
        name: data.name,
        url: data.url,
        updatedAt: new Date().toISOString()
      };
      
      return MOCK_PROJECTS[projectIndex];
    }
    
    return null;
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties = {
    "Name": { title: [{ text: { content: data.name } }] },
    "URL": { url: data.url }
  };
  
  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer le projet mis à jour
  return getProject(id);
};

/**
 * Récupère un audit par son ID
 */
export const getAudit = async (id: string) => {
  // Si nous sommes en mode mock, retourner un faux audit
  if (mockMode.isActive()) {
    console.log('Using mock audit data for ID:', id);
    return {
      id,
      name: `Audit de test`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 65,
      items: [],
      projectId: 'project-1234'
    };
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

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
    name: properties.Name?.title?.[0]?.plain_text || 
          properties.name?.title?.[0]?.plain_text || `Audit - ${new Date().toLocaleDateString()}`,
    projectId: properties.ProjectId?.rich_text?.[0]?.plain_text || 
               properties.projectId?.rich_text?.[0]?.plain_text || '',
    createdAt: response.created_time,
    updatedAt: response.last_edited_time,
    score: properties.Score?.number || 
            properties.score?.number || 0,
    items: []
  };
};
