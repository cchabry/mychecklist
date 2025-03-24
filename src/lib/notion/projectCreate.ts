
/**
 * Functions for creating and updating projects in Notion
 */

import { notionApi } from '../notionProxy';
import { ProjectData } from './types';
import { MOCK_PROJECTS } from '../mockData';

/**
 * Create a new project in Notion
 */
export const createProjectInNotion = async (name: string, url: string): Promise<ProjectData | null> => {
  try {
    console.log('✨ Début de création du projet:', name, url);
    
    // Check if we're in mock mode
    if (notionApi.mockMode.isActive()) {
      console.info('Creating mock project (mock mode active)');
      const newMockProject: ProjectData = {
        id: `project-${Date.now()}`,
        name,
        url,
        description: 'Projet créé en mode démonstration',
        status: 'Non démarré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15,
        pagesCount: 0
      };
      
      // Add the new project to mock projects for a better experience
      MOCK_PROJECTS.unshift(newMockProject);
      
      // Update the cache
      const cachedProjects = localStorage.getItem('projects_cache');
      if (cachedProjects) {
        try {
          const cache = JSON.parse(cachedProjects);
          cache.projects.unshift(newMockProject);
          localStorage.setItem('projects_cache', JSON.stringify(cache));
        } catch (e) {
          console.error('Error updating cache:', e);
        }
      } else {
        // Create new cache if none exists
        localStorage.setItem('projects_cache', JSON.stringify({
          timestamp: Date.now(),
          projects: [newMockProject, ...MOCK_PROJECTS]
        }));
      }
      
      return newMockProject;
    }
    
    // Check if Notion is configured
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) {
      console.error('Notion client or database ID is missing');
      notionApi.mockMode.activate();
      
      // Create a mock project as fallback
      const fallbackProject: ProjectData = {
        id: `project-${Date.now()}`,
        name,
        url,
        description: 'Projet créé en mode démonstration (configuration Notion manquante)',
        status: 'Non démarré',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15,
        pagesCount: 0
      };
      
      // Add to mock projects for consistency
      MOCK_PROJECTS.unshift(fallbackProject);
      
      return fallbackProject;
    }
    
    // Force deactivation of mock mode
    notionApi.mockMode.forceReset();
    console.log('✅ Mock mode disabled for project creation');
    
    // Test connection before creating
    try {
      const user = await notionApi.users.me(apiKey);
      console.log('Notion connection verified before creating project:', user.name);
      
      // Test database access
      const db = await notionApi.databases.retrieve(dbId, apiKey);
      console.log('Database access verified:', db.title?.[0]?.plain_text || dbId);
      
      // Analyze database structure to better adapt our properties
      console.log('Analysing database structure:', Object.keys(db.properties).join(', '));
      
      // Check if certain properties are required in the database
      const requiredProps = Object.entries(db.properties)
        .filter(([_, prop]: [string, any]) => 
          prop.type === 'title' || 
          (prop.type === 'rich_text' && prop.rich_text?.is_required))
        .map(([name, _]: [string, any]) => name);
      
      console.log('Required properties in database:', requiredProps);
    } catch (connError) {
      console.error('Connection test failed:', connError);
      throw connError; // Propagate error for better diagnosis
    }
    
    // Adapt property names to those used in your Notion database
    const properties: any = {
      "Name": { title: [{ text: { content: name } }] },
      "URL": { url: url },
      "Description": { rich_text: [{ text: { content: 'Projet créé via l\'application' } }] },
      "Status": { select: { name: 'Non démarré' } },
      "Progress": { number: 0 },
      "ItemsCount": { number: 15 },
      "PagesCount": { number: 0 }
    };
    
    // Add alternative properties with different cases
    // These alternatives are removed by the proxy if unnecessary
    properties.Nom = properties.Name;
    properties.Titre = properties.Name;
    properties.Url = properties.URL;
    properties.url = properties.URL;
    properties.Description = { rich_text: [{ text: { content: 'Projet créé via l\'application' } }] };
    properties.description = properties.Description;
    
    // Log prepared properties
    console.log('Prepared properties for creation:', JSON.stringify(properties, null, 2));
    
    // Clear cache before creation
    localStorage.removeItem('projects_cache');
    
    // Create page in Notion via proxy, with more details for debugging
    console.log(`Creating project in Notion database: ${dbId} with API key: ${apiKey.substring(0, 8)}...`);
    
    const payload = {
      parent: { database_id: dbId },
      properties
    };
    
    console.log('Payload for Notion creation:', JSON.stringify(payload, null, 2));
    
    const response = await notionApi.pages.create(payload, apiKey);
    
    if (!response || !response.id) {
      throw new Error('Failed to create project in Notion: No ID returned');
    }
    
    console.log('Project created successfully in Notion:', response.id);
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    // Convert response to project
    const newProject: ProjectData = {
      id: response.id,
      name,
      url,
      description: 'Projet créé via l\'application',
      status: 'Non démarré',
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      progress: 0,
      itemsCount: 15,
      pagesCount: 0
    };
    
    // Force a data refresh
    setTimeout(() => {
      localStorage.removeItem('projects_cache');
    }, 500);
    
    return newProject;
  } catch (error) {
    console.error('Error creating project in Notion:', error);
    console.error('Error details:', error.message);
    
    // Capture and display more details about the error
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response, null, 2));
    }
    
    throw error;
  }
};
