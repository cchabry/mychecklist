
import { getNotionClient, testNotionConnection } from './notionClient';
import { ProjectData, ProjectsData } from './types';
import { MOCK_PROJECTS } from '../mockData';
import { notionApi } from '../notionProxy';

export const getProjectsFromNotion = async (): Promise<ProjectsData> => {
  const dbId = localStorage.getItem('notion_database_id');
  console.info('Fetching projects from Notion, database ID:', dbId);
  
  try {
    // Vérifier si on est en mode mock
    if (notionApi.mockMode.isActive()) {
      console.info('Using mock project data (mode mock active)');
      return { projects: MOCK_PROJECTS };
    }
    
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      notionApi.mockMode.activate();
      return { projects: MOCK_PROJECTS };
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Vérifier la connexion à l'API Notion
    try {
      // Test simple de la connexion
      await notionApi.users.me(apiKey);
      console.log('Notion connection verified via proxy');
    } catch (connError) {
      console.error('Failed to connect to Notion API:', connError);
      if (connError.message?.includes('Failed to fetch') || connError.message?.includes('401') || connError.message?.includes('403')) {
        notionApi.mockMode.activate();
        console.info('Switching to mock data due to connection error');
        return { projects: MOCK_PROJECTS };
      }
      throw connError;
    }
    
    // Utiliser notre proxy pour interroger la base de données
    console.log('Requesting database query via proxy...');
    const response = await notionApi.databases.query(dbId, {}, apiKey);
    
    if (!response || !response.results) {
      throw new Error('Invalid response from Notion API');
    }
    
    console.log(`Notion API returned ${response.results.length} projects`);
    
    // Mapper les résultats en projets
    const projects: ProjectData[] = response.results.map((page: any) => {
      const properties = page.properties;
      
      // Log des propriétés pour le débogage
      console.log('Propriétés du projet:', JSON.stringify(properties, null, 2));
      
      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || 
              properties.name?.title?.[0]?.plain_text || 'Sans titre',
        url: properties.URL?.url || 
             properties.url?.url || 
             properties.Url?.url || '#',
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
                    properties.Nombre?.number || 15  // Ajouté "Nombre" comme fallback
      };
    });
    
    // Sauvegarder les données en cache pour améliorer les performances
    localStorage.setItem('projects_cache', JSON.stringify({ 
      timestamp: Date.now(), 
      projects 
    }));
    
    return { projects };
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    
    // Si le mode mock est activé ou si c'est une erreur de type 'Failed to fetch', utiliser les données de test
    if (error.message?.includes('Failed to fetch') || error.message?.includes('403') || error.message?.includes('401')) {
      console.info('Switching to mock data due to API error');
      notionApi.mockMode.activate();
      return { projects: MOCK_PROJECTS };
    }
    
    // Propager l'erreur pour d'autres types d'erreurs
    throw error;
  }
};

// Récupérer un projet par son ID
export const getProjectById = async (id: string): Promise<ProjectData | null> => {
  try {
    // Essayer de charger depuis le cache d'abord
    const cachedProjects = localStorage.getItem('projects_cache');
    if (cachedProjects) {
      try {
        const { projects } = JSON.parse(cachedProjects);
        const project = projects.find((p: ProjectData) => p.id === id);
        if (project) {
          console.log('Project found in cache:', project.name);
          return project;
        }
      } catch (e) {
        console.error('Error parsing cached projects:', e);
      }
    }
    
    // Vérifier si on est en mode mock
    if (notionApi.mockMode.isActive()) {
      console.log('Getting mock project by ID (mode mock active):', id);
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    // Vérifier si Notion est configuré
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      return null;
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Tester la connexion avant de continuer
    try {
      await notionApi.users.me(apiKey);
      console.log('Notion connection verified before getting project');
    } catch (connError) {
      console.error('Connection test failed:', connError);
      if (connError.message?.includes('Failed to fetch') || connError.message?.includes('401') || connError.message?.includes('403')) {
        notionApi.mockMode.activate();
        console.log('Switching to mock mode due to connection error');
        const mockProject = MOCK_PROJECTS.find(project => project.id === id);
        return mockProject || null;
      }
      throw connError;
    }
    
    // Utiliser notre proxy pour récupérer la page spécifique
    console.log('Requesting page from Notion:', id);
    const response = await notionApi.pages.retrieve(id, apiKey);
    
    if (!response) {
      throw new Error('Invalid response from Notion API');
    }
    
    // Log des données pour le débogage
    console.log('Données du projet depuis Notion:', JSON.stringify(response, null, 2));
    
    // Convertir la page Notion en projet
    const properties = response.properties;
    const project: ProjectData = {
      id: response.id,
      name: properties.Name?.title?.[0]?.plain_text || 
            properties.name?.title?.[0]?.plain_text || 'Sans titre',
      url: properties.URL?.url || 
           properties.url?.url || 
           properties.Url?.url || '#',
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
                  properties.Nombre?.number || 15  // Ajouté "Nombre" comme fallback
    };
    
    return project;
  } catch (error) {
    console.error('Erreur lors de la récupération du projet depuis Notion:', error);
    
    // En cas d'erreur de connexion, utiliser les données de test
    if (error.message?.includes('Failed to fetch') || error.message?.includes('403') || error.message?.includes('401')) {
      notionApi.mockMode.activate();
      console.log('Switching to mock mode due to fetch error');
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    return null;
  }
};

// Créer un nouveau projet dans Notion
export const createProjectInNotion = async (name: string, url: string): Promise<ProjectData | null> => {
  try {
    // Vérifier si on est en mode mock
    if (notionApi.mockMode.isActive()) {
      console.info('Creating mock project (mode mock active)');
      const newMockProject: ProjectData = {
        id: `project-${Date.now()}`,
        name,
        url,
        description: 'Projet créé en mode démonstration',
        status: 'Non démarré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15
      };
      
      // Ajouter le nouveau projet aux projets simulés pour une meilleure expérience
      MOCK_PROJECTS.unshift(newMockProject);
      
      // Mettre à jour le cache
      const cachedProjects = localStorage.getItem('projects_cache');
      if (cachedProjects) {
        try {
          const cache = JSON.parse(cachedProjects);
          cache.projects.unshift(newMockProject);
          localStorage.setItem('projects_cache', JSON.stringify(cache));
        } catch (e) {}
      }
      
      return newMockProject;
    }
    
    // Vérifier si Notion est configuré
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      notionApi.mockMode.activate();
      
      // Créer un projet mock comme fallback
      const fallbackProject: ProjectData = {
        id: `project-${Date.now()}`,
        name,
        url,
        description: 'Projet créé en mode démonstration (configuration Notion manquante)',
        status: 'Non démarré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15
      };
      
      return fallbackProject;
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Tester la connexion avant de créer
    try {
      await notionApi.users.me(apiKey);
      console.log('Notion connection verified before creating project');
      
      // Tester l'accès à la base de données
      await notionApi.databases.retrieve(dbId, apiKey);
      console.log('Database access verified:', dbId);
    } catch (connError) {
      console.error('Connection test failed:', connError);
      if (connError.message?.includes('Failed to fetch') || connError.message?.includes('401') || connError.message?.includes('403')) {
        notionApi.mockMode.activate();
        console.log('Switching to mock mode due to connection error');
        
        const newMockProject: ProjectData = {
          id: `project-${Date.now()}`,
          name,
          url,
          description: 'Projet créé en mode démonstration (après échec de connexion)',
          status: 'Non démarré',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
          itemsCount: 15
        };
        
        // Ajouter aux projets mock pour cohérence
        MOCK_PROJECTS.unshift(newMockProject);
        
        return newMockProject;
      }
      throw connError;
    }
    
    // Adapter les noms des propriétés à ceux utilisés dans votre base Notion
    // Utiliser les noms de propriétés avec la première lettre en minuscule et en majuscule
    const properties: any = {};
    
    // Name/name - obligatoire
    properties.Name = {
      title: [{ text: { content: name } }]
    };
    
    // URL/url - obligatoire
    properties.URL = {
      url: url
    };
    
    // Description/description - optionnel
    properties.Description = {
      rich_text: [{ text: { content: 'Projet créé via l\'application' } }]
    };
    
    // Status/status - optionnel
    properties.Status = {
      select: { name: 'Non démarré' }
    };
    
    // Progress/progress - optionnel
    properties.Progress = {
      number: 0
    };
    
    // ItemsCount/itemsCount - optionnel
    properties.ItemsCount = {
      number: 15
    };
    
    // Log des propriétés préparées
    console.log('Préparation des propriétés pour création:', JSON.stringify(properties, null, 2));
    
    // Créer la page dans Notion via le proxy
    console.log('Creating project in Notion database:', dbId);
    const response = await notionApi.pages.create({
      parent: { database_id: dbId },
      properties
    }, apiKey);
    
    if (!response || !response.id) {
      throw new Error('Failed to create project in Notion');
    }
    
    console.log('Project created successfully in Notion:', response.id);
    console.log('Réponse complète:', JSON.stringify(response, null, 2));
    
    // Convertir la réponse en projet
    const newProject: ProjectData = {
      id: response.id,
      name,
      url,
      description: 'Projet créé via l\'application',
      status: 'Non démarré',
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      progress: 0,
      itemsCount: 15
    };
    
    // Mettre à jour le cache
    const cachedProjects = localStorage.getItem('projects_cache');
    if (cachedProjects) {
      try {
        const cache = JSON.parse(cachedProjects);
        cache.projects.unshift(newProject);
        localStorage.setItem('projects_cache', JSON.stringify(cache));
      } catch (e) {}
    }
    
    return newProject;
  } catch (error) {
    console.error('Erreur lors de la création du projet dans Notion:', error);
    console.error('Détails de l\'erreur:', error.message);
    
    // Activer le mode mock en cas d'échec et retourner un projet fictif
    if (error.message?.includes('Failed to fetch') || error.message?.includes('403') || error.message?.includes('401')) {
      notionApi.mockMode.activate();
      console.log('Switching to mock mode due to fetch error');
      
      const newMockProject: ProjectData = {
        id: `project-${Date.now()}`,
        name,
        url,
        description: 'Projet créé en mode démonstration (après échec de connexion)',
        status: 'Non démarré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15
      };
      
      // Ajouter aux projets mock pour cohérence
      MOCK_PROJECTS.unshift(newMockProject);
      
      return newMockProject;
    }
    
    return null;
  }
};
