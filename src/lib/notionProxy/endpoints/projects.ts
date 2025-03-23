
import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { mockProjects } from '../../mockData';
import { cleanProjectId } from '../../utils';

/**
 * Récupère tous les projets
 */
export const getProjects = async () => {
  // Si nous sommes en mode démo, retourner les données mock
  if (operationMode.isDemoMode) {
    console.log('Using mock projects data');
    return mockProjects;
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(`/databases/${dbId}/query`, 'POST', {}, apiKey);

  // Mapper les résultats en projets
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      name: properties.Name?.title?.[0]?.plain_text || properties.name?.title?.[0]?.plain_text || 'Sans titre',
      url: properties.URL?.url || properties.url?.url || properties.Url?.url || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || properties.description?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name || properties.status?.select?.name || 'Non démarré',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      progress: properties.Progress?.number || properties.progress?.number || 0,
      itemsCount: properties.ItemsCount?.number || properties.itemsCount?.number || properties.Nombre?.number || 15,
      pagesCount: properties.PagesCount?.number || properties.pagesCount?.number || 0
    };
  });
};

/**
 * Récupère un projet par son ID de manière fiable
 * Implémentation simplifiée et robuste
 */
export const getProject = async (id: string) => {
  // Nettoyer l'ID pour assurer la cohérence
  const cleanedId = cleanProjectId(id);
  console.log(`🔍 getProject - ID original: "${id}", ID nettoyé: "${cleanedId}"`);

  if (!cleanedId) {
    console.error("❌ getProject - ID invalide après nettoyage");
    return null;
  }

  // Si nous sommes en mode démo, retourner les données mock
  if (operationMode.isDemoMode) {
    console.log(`🔍 getProject - Recherche du projet mock ID: "${cleanedId}"`);
    
    // Rechercher le projet dans les données mock
    const mockProject = mockProjects.find((project) => project.id === cleanedId);
    
    if (mockProject) {
      console.log(`✅ getProject - Projet mock trouvé: "${mockProject.name}"`);
    } else {
      console.error(`❌ getProject - Projet mock non trouvé pour ID: "${cleanedId}"`);
    }
    
    return mockProject || null;
  }

  // Sinon, récupérer depuis Notion
  try {
    const apiKey = localStorage.getItem('notion_api_key');
    
    if (!apiKey) {
      console.error("❌ getProject - Clé API Notion manquante");
      throw new Error('Clé API Notion manquante');
    }
    
    console.log(`🔍 getProject - Appel API Notion pour page ID: "${cleanedId}"`);
    const response = await notionApiRequest(`/pages/${cleanedId}`, 'GET', undefined, apiKey);
    
    if (!response) {
      console.error(`❌ getProject - Réponse vide de l'API Notion pour ID: "${cleanedId}"`);
      return null;
    }
    
    const properties = response.properties;
    console.log(`✅ getProject - Projet Notion récupéré: "${properties.Name?.title?.[0]?.plain_text || 'Sans titre'}"`);
    
    return {
      id: response.id,
      name: properties.Name?.title?.[0]?.plain_text || properties.name?.title?.[0]?.plain_text || 'Sans titre',
      url: properties.URL?.url || properties.url?.url || properties.Url?.url || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || properties.description?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name || properties.status?.select?.name || 'Non démarré',
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      progress: properties.Progress?.number || properties.progress?.number || 0,
      itemsCount: properties.ItemsCount?.number || properties.itemsCount?.number || properties.Nombre?.number || 15,
      pagesCount: properties.PagesCount?.number || properties.pagesCount?.number || 0
    };
  } catch (error: any) {
    console.error(`❌ getProject - Erreur lors de la récupération du projet ID: "${cleanedId}"`, error);
    
    // Activer le mode démo en cas d'erreur d'accès à l'API
    if (error.message?.includes('Failed to fetch') || error.message?.includes('401')) {
      console.log('🔄 getProject - Activation du mode démo suite à une erreur API');
      operationMode.enableDemoMode('Erreur de connexion à l\'API Notion');
      
      // Retenter avec les données mock
      return getProject(cleanedId);
    }
    
    return null;
  }
};

/**
 * Crée un nouveau projet
 */
export const createProject = async (data: { name: string; url: string }) => {
  // Si nous sommes en mode démo, créer un faux projet
  if (operationMode.isDemoMode) {
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
      itemsCount: 15,
      pagesCount: 0
    };
    
    // Ajouter aux projets mock pour cohérence
    mockProjects.unshift(newProject);
    
    return newProject;
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "Name": {
      title: [
        {
          text: {
            content: data.name
          }
        }
      ]
    },
    "URL": {
      url: data.url
    },
    "Description": {
      rich_text: [
        {
          text: {
            content: 'Projet créé via l\'application'
          }
        }
      ]
    },
    "Status": {
      select: {
        name: 'Non démarré'
      }
    },
    "Progress": {
      number: 0
    },
    "ItemsCount": {
      number: 15
    },
    "PagesCount": {
      number: 0
    }
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
    itemsCount: 15,
    pagesCount: 0
  };
};

/**
 * Met à jour un projet existant
 */
export const updateProject = async (id: string, data: { name: string; url: string }) => {
  // Si nous sommes en mode démo, mettre à jour un faux projet
  if (operationMode.isDemoMode) {
    console.log('Updating mock project with ID:', id);
    
    const projectIndex = mockProjects.findIndex((project) => project.id === id);
    
    if (projectIndex !== -1) {
      mockProjects[projectIndex] = {
        ...mockProjects[projectIndex],
        name: data.name,
        url: data.url,
        updatedAt: new Date().toISOString()
      };
      
      return mockProjects[projectIndex];
    }
    
    return null;
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties = {
    "Name": {
      title: [
        {
          text: {
            content: data.name
          }
        }
      ]
    },
    "URL": {
      url: data.url
    }
  };

  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    {
      properties
    },
    apiKey
  );

  // Récupérer le projet mis à jour
  return getProject(id);
};

/**
 * Supprime un projet
 */
export const deleteProject = async (id: string) => {
  // Si nous sommes en mode démo, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting mock project with ID:', id);
    
    const projectIndex = mockProjects.findIndex((project) => project.id === id);
    
    if (projectIndex !== -1) {
      mockProjects.splice(projectIndex, 1);
      return true;
    }
    
    return false;
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
    console.error(`Erreur lors de la suppression du projet #${id}:`, error);
    return false;
  }
};
