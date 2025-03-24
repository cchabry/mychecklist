
/**
 * Functions for retrieving projects from Notion
 */

import { getNotionClient, testNotionConnection } from './notionClient';
import { ProjectData, ProjectsData } from './types';
import { MOCK_PROJECTS } from '../mockData';
import { notionApi } from '../notionProxy';
import { toast } from 'sonner';
import { cleanProjectId } from './utils';

/**
 * Retrieve all projects from Notion
 */
export const getProjectsFromNotion = async (): Promise<ProjectsData> => {
  const dbId = localStorage.getItem('notion_database_id');
  console.info('Fetching projects from Notion, database ID:', dbId);
  
  // Check if we're in mock mode first
  if (notionApi.mockMode.isActive()) {
    console.info('Using mock project data (mock mode active)');
    return { projects: MOCK_PROJECTS };
  }
  
  try {
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé', { 
        description: 'Configuration Notion incomplète. L\'application utilise des données fictives.'
      });
      return { projects: MOCK_PROJECTS };
    }
    
    // Get API key
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé', { 
        description: 'Clé API Notion manquante. L\'application utilise des données fictives.'
      });
      return { projects: MOCK_PROJECTS };
    }
    
    // Verify connection to Notion API
    try {
      // Simple connection test
      await notionApi.users.me(apiKey);
      console.log('Notion connection verified via proxy');
    } catch (connError) {
      console.error('Failed to connect to Notion API:', connError);
      
      // Activate mock mode for any connection error
      notionApi.mockMode.activate();
      
      // Display informative toast
      toast.info('Mode démonstration activé', {
        description: 'Problème de connexion à Notion. L\'application utilise des données fictives.'
      });
      
      console.info('Switching to mock data due to connection error');
      return { projects: MOCK_PROJECTS };
    }
    
    // Use our proxy to query the database
    console.log('Requesting database query via proxy...');
    const response = await notionApi.databases.query(dbId, {}, apiKey);
    
    if (!response || !response.results) {
      throw new Error('Invalid response from Notion API');
    }
    
    console.log(`Notion API returned ${response.results.length} projects`);
    
    // Map results to projects
    const projects: ProjectData[] = response.results.map((page: any) => {
      const properties = page.properties;
      
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
                    properties.Nombre?.number || 15,
        pagesCount: properties.PagesCount?.number || 
                   properties.pagesCount?.number || 0
      };
    });
    
    // Cache data to improve performance
    localStorage.setItem('projects_cache', JSON.stringify({ 
      timestamp: Date.now(), 
      projects 
    }));
    
    return { projects };
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    
    // Activate mock mode for any error
    notionApi.mockMode.activate();
    
    // Display informative toast
    toast.info('Mode démonstration activé', {
      description: 'Erreur lors de la récupération des projets. L\'application utilise des données fictives.'
    });
    
    console.info('Switching to mock data due to API error');
    return { projects: MOCK_PROJECTS };
  }
};

/**
 * Retrieve a single project by ID
 */
export const getProjectById = async (id: string): Promise<ProjectData | null> => {
  try {
    // Try to load from cache first
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
    
    // Check if we're in mock mode
    if (notionApi.mockMode.isActive()) {
      console.log('Getting mock project by ID (mock mode active):', id);
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    // Check if Notion is configured
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      return null;
    }
    
    // Get API key
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Test connection before continuing
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
    
    // Use our proxy to retrieve the specific page
    console.log('Requesting page from Notion:', id);
    const response = await notionApi.pages.retrieve(id, apiKey);
    
    if (!response) {
      throw new Error('Invalid response from Notion API');
    }
    
    // Log data for debugging
    console.log('Projet data from Notion:', JSON.stringify(response, null, 2));
    
    // Convert Notion page to project
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
                  properties.Nombre?.number || 15,
      pagesCount: properties.PagesCount?.number || 
                 properties.pagesCount?.number || 0
    };
    
    return project;
  } catch (error) {
    console.error('Erreur lors de la récupération du projet depuis Notion:', error);
    
    // In case of connection error, use mock data
    if (error.message?.includes('Failed to fetch') || error.message?.includes('403') || error.message?.includes('401')) {
      notionApi.mockMode.activate();
      console.log('Switching to mock mode due to fetch error');
      const mockProject = MOCK_PROJECTS.find(project => project.id === id);
      return mockProject || null;
    }
    
    return null;
  }
};
