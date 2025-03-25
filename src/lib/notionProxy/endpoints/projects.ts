import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { cleanProjectId } from '../../utils';

/**
 * Récupère tous les projets
 */
export const getProjects = async () => {
  // Si nous sommes en mode mock, retourner les données mock
  if (operationMode.isDemoMode) {
    console.log('Using mock projects data');
    return MOCK_PROJECTS;
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(`/databases/${dbId}/query`, 'POST', {}, apiKey);

  // Mapper les résultats en projets
  return response.results.map((page) => {
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
 * Implémentation améliorée pour éviter les bascules inappropriées en mode démo
 */
export const getProject = async (id) => {
  // Nettoyer l'ID pour assurer la cohérence
  const cleanedId = cleanProjectId(id);
  console.log(`🔍 getProject - ID original: "${id}", ID nettoyé: "${cleanedId}"`);
  
  if (!cleanedId) {
    console.error("❌ getProject - ID invalide après nettoyage");
    return null;
  }

  // IMPORTANT: Mémoriser le mode actuel au début de la fonction
  // pour éviter une bascule en mode démo au milieu de l'exécution
  const startInDemoMode = operationMode.isDemoMode;
  console.log(`🔍 getProject - Mode au démarrage: ${startInDemoMode ? 'DÉMO' : 'RÉEL'}`);

  // Vérifier si nous avons un ID de projet récemment créé
  // Cette vérification aide à maintenir la cohérence pendant la navigation post-création
  const recentlyCreatedId = localStorage.getItem('recently_created_project_id');
  if (recentlyCreatedId && cleanedId === cleanProjectId(recentlyCreatedId)) {
    console.log(`🔍 getProject - Projet récemment créé détecté: "${cleanedId}"`);
    // Démarrer en mode réel si possible pour les projets récemment créés
    if (startInDemoMode) {
      console.log(`🔍 getProject - Désactivation temporaire du mode démo pour projet récent`);
      operationMode.temporarilyForceReal();
    }
  }

  // Si nous sommes en mode mock, retourner les données mock
  if (operationMode.isDemoMode) {
    console.log(`🔍 getProject - Recherche du projet mock ID: "${cleanedId}"`);
    
    // Rechercher le projet dans les données mock
    // Important: Comparer sans les tirets car ils sont parfois inclus dans l'ID
    const mockProject = MOCK_PROJECTS.find((project) => {
      // Normaliser les deux IDs pour la comparaison
      const normalizedProjectId = cleanProjectId(project.id);
      const normalizedRequestId = cleanedId;
      
      console.log(`Comparaison: [${normalizedProjectId}] avec [${normalizedRequestId}]`);
      return normalizedProjectId === normalizedRequestId;
    });
    
    if (mockProject) {
      console.log(`✅ getProject - Projet mock trouvé: "${mockProject.name}"`);
    } else {
      // Si nous ne trouvons pas le projet en mode démo et qu'il s'agit d'un projet récemment créé,
      // créons un mock projet correspondant pour améliorer l'expérience utilisateur
      if (recentlyCreatedId && cleanedId === cleanProjectId(recentlyCreatedId)) {
        const cachedProjectData = localStorage.getItem(`project_data_${cleanedId}`);
        if (cachedProjectData) {
          try {
            const projectData = JSON.parse(cachedProjectData);
            console.log(`🔄 getProject - Création d'un mock projet pour ID récent: "${cleanedId}"`);
            const newMockProject = {
              id: cleanedId,
              name: projectData.name || 'Projet récemment créé',
              url: projectData.url || '',
              description: 'Projet créé puis visualisé en mode démonstration',
              status: 'Non démarré',
              createdAt: projectData.createdAt || new Date().toISOString(),
              updatedAt: projectData.updatedAt || new Date().toISOString(),
              progress: 0,
              itemsCount: 15,
              pagesCount: 0
            };
            
            // Ajouter temporairement aux projets mock
            MOCK_PROJECTS.unshift(newMockProject);
            return newMockProject;
          } catch (e) {
            console.error(`❌ getProject - Erreur lors de la création du mock projet: ${e.message}`);
          }
        }
      }
      
      // Logs détaillés pour déboguer pourquoi le projet n'est pas trouvé
      console.error(`❌ getProject - Projet mock non trouvé pour ID: "${cleanedId}"`);
      console.log("Projets disponibles:", MOCK_PROJECTS.map(p => ({id: p.id, name: p.name})));
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
    
    // Essayons d'abord de trouver le projet dans le cache
    const cachedProjects = localStorage.getItem('projects_cache');
    if (cachedProjects) {
      try {
        const { projects } = JSON.parse(cachedProjects);
        
        // Utiliser cleanProjectId pour normaliser la comparaison
        const projectInCache = projects.find(p => cleanProjectId(p.id) === cleanedId);
        
        if (projectInCache) {
          console.log(`✅ getProject - Projet trouvé dans le cache: "${projectInCache.name}"`);
          
          // Sauvegarder les données du projet pour référence future si nécessaire
          localStorage.setItem(`project_data_${cleanedId}`, JSON.stringify(projectInCache));
          
          return projectInCache;
        }
      } catch (e) {
        console.error('Erreur lors de la lecture du cache des projets:', e);
      }
    }
    
    // Si pas dans le cache, faire une requête API
    const response = await notionApiRequest(`/pages/${cleanedId}`, 'GET', undefined, apiKey);
    
    if (!response) {
      console.error(`❌ getProject - Réponse vide de l'API Notion pour ID: "${cleanedId}"`);
      return null;
    }

    const properties = response.properties;
    console.log(`✅ getProject - Projet Notion récupéré: "${properties.Name?.title?.[0]?.plain_text || 'Sans titre'}"`);
    
    const project = {
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
    
    // Sauvegarder les données du projet pour référence future
    localStorage.setItem(`project_data_${cleanedId}`, JSON.stringify(project));
    
    return project;
  } catch (error) {
    console.error(`❌ getProject - Erreur lors de la récupération du projet ID: "${cleanedId}"`, error);
    
    // Activer le mode démo en cas d'erreur d'accès à l'API
    if (error.message?.includes('Failed to fetch') || error.message?.includes('401')) {
      console.log('🔄 getProject - Activation du mode démo suite à une erreur API');
      operationMode.enableDemoMode('Erreur API Notion');
      
      // Retenter avec les données mock
      return getProject(cleanedId);
    }
    
    return null;
  }
};

/**
 * Crée un nouveau projet
 */
export const createProject = async (data) => {
  // Si nous sommes en mode mock, créer un faux projet
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

  const response = await notionApiRequest(`/pages`, 'POST', {
    parent: {
      database_id: dbId
    },
    properties
  }, apiKey);

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
export const updateProject = async (id, data) => {
  // Si nous sommes en mode mock, mettre à jour un faux projet
  if (operationMode.isDemoMode) {
    console.log('Updating mock project with ID:', id);
    const projectIndex = MOCK_PROJECTS.findIndex((project) => project.id === id);
    
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

  await notionApiRequest(`/pages/${id}`, 'PATCH', {
    properties
  }, apiKey);

  // Récupérer le projet mis à jour
  return getProject(id);
};

/**
 * Supprime un projet
 */
export const deleteProject = async (id) => {
  // Si nous sommes en mode mock, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting mock project with ID:', id);
    const projectIndex = MOCK_PROJECTS.findIndex((project) => project.id === id);
    
    if (projectIndex !== -1) {
      MOCK_PROJECTS.splice(projectIndex, 1);
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
    await notionApiRequest(`/pages/${id}`, 'PATCH', {
      archived: true
    }, apiKey);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet #${id}:`, error);
    return false;
  }
};
