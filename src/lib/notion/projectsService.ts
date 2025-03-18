
import { getNotionClient, testNotionConnection } from './notionClient';
import { ProjectData, ProjectsData } from './types';
import { MOCK_PROJECTS } from '../mockData';
import { notionApi } from '../notionProxy';

export const getProjectsFromNotion = async (): Promise<ProjectsData> => {
  console.info('Fetching projects from Notion, database ID:', localStorage.getItem('notion_database_id'));
  
  try {
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      return { projects: [] };
    }
    
    // Vérifier la connexion à l'API Notion
    if (!(await testNotionConnection(client))) {
      throw new Error('Failed to connect to Notion API');
    }
    
    // Si le mode mock est actif, retourner les données de test
    if (notionApi.mockMode.isActive()) {
      console.info('Using mock project data');
      return { projects: MOCK_PROJECTS };
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Utiliser notre proxy pour interroger la base de données
    const response = await notionApi.databases.query(dbId, {}, apiKey);
    
    if (!response || !response.results) {
      throw new Error('Invalid response from Notion API');
    }
    
    // Mapper les résultats en projets
    const projects: ProjectData[] = response.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || 'Sans titre',
        url: properties.URL?.url || '#',
        description: properties.Description?.rich_text?.[0]?.plain_text || '',
        status: properties.Status?.select?.name || 'Non démarré',
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
        progress: properties.Progress?.number || 0,
        itemsCount: 15 // Default number of checklist items
      };
    });
    
    return { projects };
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    
    // Si le mode mock est activé ou si c'est une erreur de type 'Failed to fetch', utiliser les données de test
    if (error.message?.includes('Failed to fetch') || notionApi.mockMode.isActive()) {
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
    // Vérifier si Notion est configuré
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId || notionApi.mockMode.isActive()) {
      // Utiliser les données de test en cas d'absence de configuration ou en mode mock
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Utiliser notre proxy pour récupérer la page spécifique
    const response = await notionApi.pages.retrieve(id, apiKey);
    
    if (!response) {
      throw new Error('Invalid response from Notion API');
    }
    
    // Convertir la page Notion en projet
    const properties = response.properties;
    const project: ProjectData = {
      id: response.id,
      name: properties.Name?.title?.[0]?.plain_text || 'Sans titre',
      url: properties.URL?.url || '#',
      description: properties.Description?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name || 'Non démarré',
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      progress: properties.Progress?.number || 0,
      itemsCount: 15 // Default number of checklist items
    };
    
    return project;
  } catch (error) {
    console.error('Erreur lors de la récupération du projet depuis Notion:', error);
    
    // En cas d'erreur, utiliser les données de test
    if (notionApi.mockMode.isActive()) {
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    return null;
  }
};

// Créer un nouveau projet dans Notion
export const createProjectInNotion = async (name: string, url: string): Promise<ProjectData | null> => {
  try {
    // Vérifier si Notion est configuré
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      return null;
    }
    
    // Si mode mock, retourner un projet fictif
    if (notionApi.mockMode.isActive()) {
      console.info('Using mock mode for project creation');
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
      
      return newMockProject;
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Préparer les propriétés pour la création
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: name
            }
          }
        ]
      },
      URL: {
        url: url
      },
      Description: {
        rich_text: [
          {
            text: {
              content: 'Projet créé via l\'application'
            }
          }
        ]
      },
      Status: {
        select: {
          name: 'Non démarré'
        }
      },
      Progress: {
        number: 0
      }
    };
    
    // Créer la page dans Notion via le proxy
    const response = await notionApi.pages.create({
      parent: { database_id: dbId },
      properties
    }, apiKey);
    
    if (!response || !response.id) {
      throw new Error('Failed to create project in Notion');
    }
    
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
    
    return newProject;
  } catch (error) {
    console.error('Erreur lors de la création du projet dans Notion:', error);
    
    // Activer le mode mock en cas d'échec et retourner un projet fictif
    if (error.message?.includes('Failed to fetch')) {
      notionApi.mockMode.activate();
      
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
      
      return newMockProject;
    }
    
    return null;
  }
};
