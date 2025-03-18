
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Project } from './types';
import { getNotionClient, testNotionConnection, notionPropertyExtractors } from './notionClient';

/**
 * Fetches all projects from Notion
 */
export const getProjectsFromNotion = async (): Promise<Project[] | null> => {
  const { client, dbId } = getNotionClient();
  if (!client || !dbId) return null;
  
  try {
    console.log('Fetching projects from Notion, database ID:', dbId);
    
    // Test the connection
    const connectionOk = await testNotionConnection(client);
    if (!connectionOk) throw new Error('Failed to connect to Notion API');
    
    const response = await client.databases.query({
      database_id: dbId
    });
    
    console.log('Notion response:', response.results.length, 'results');
    
    if (response.results.length === 0) return [];
    
    // Convert Notion results to projects
    const projects: Project[] = [];
    const { getRichTextValue, getTitleValue, getUrlValue, getNumberValue } = notionPropertyExtractors;
    
    for (const page of response.results as PageObjectResponse[]) {
      if (!('properties' in page)) continue;
      
      const properties = page.properties;
      console.log('Processing page with properties:', Object.keys(properties));
      
      // Create project object
      try {
        const project: Project = {
          id: getRichTextValue(properties.id) || page.id, // Use Notion ID as fallback
          name: getTitleValue(properties.name) || getTitleValue(properties.Name) || 'Projet sans nom',
          url: getUrlValue(properties.url) || getUrlValue(properties.URL) || '',
          createdAt: page.created_time || new Date().toISOString(),
          updatedAt: page.last_edited_time || new Date().toISOString(),
          progress: getNumberValue(properties.progress) || getNumberValue(properties.Progress),
          itemsCount: getNumberValue(properties.itemsCount) || getNumberValue(properties.ItemsCount) || 0
        };
        
        console.log('Added project:', project.name);
        projects.push(project);
      } catch (projectError) {
        console.error('Erreur lors de la création du projet:', projectError);
      }
    }
    
    return projects;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    return null;
  }
};

/**
 * Gets a specific project by ID
 */
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const { client, dbId } = getNotionClient();
  if (!client || !dbId) return null;
  
  try {
    const response = await client.databases.query({
      database_id: dbId,
      filter: {
        property: 'id',
        rich_text: {
          equals: projectId
        }
      }
    });
    
    if (response.results.length === 0) return null;
    
    // Ensure we have a complete page response
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    const properties = page.properties;
    const { getRichTextValue, getTitleValue, getUrlValue, getNumberValue } = notionPropertyExtractors;
    
    // Adapt Notion format to app format
    return {
      id: getRichTextValue(properties.id),
      name: getTitleValue(properties.name),
      url: getUrlValue(properties.url),
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      progress: getNumberValue(properties.progress),
      itemsCount: getNumberValue(properties.itemsCount)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return null;
  }
};

/**
 * Creates a new project in Notion
 */
export const createProjectInNotion = async (name: string, url: string): Promise<Project | null> => {
  const { client, dbId } = getNotionClient();
  if (!client || !dbId) return null;
  
  try {
    console.log('Creating project in Notion:', { name, url, databaseId: dbId });
    
    // Test connection
    const connectionOk = await testNotionConnection(client);
    if (!connectionOk) throw new Error('Failed to connect to Notion API');
    
    // Generate a unique ID for the project
    const projectId = `project-${Date.now()}`;
    const creationTime = new Date().toISOString();
    
    // Create a new page (project) in the Notion database
    const response = await client.pages.create({
      parent: {
        database_id: dbId
      },
      properties: {
        // Adapt these properties to your database structure
        "name": {
          title: [
            {
              text: {
                content: name
              }
            }
          ]
        },
        "id": {
          rich_text: [
            {
              text: {
                content: projectId
              }
            }
          ]
        },
        "url": {
          url: url
        },
        "progress": {
          number: 0
        },
        "itemsCount": {
          number: 0
        }
      }
    });
    
    console.log('Project created in Notion:', response.id);
    
    // Return the created project with current timestamps
    return {
      id: projectId,
      name: name,
      url: url,
      createdAt: creationTime,
      updatedAt: creationTime,
      progress: 0,
      itemsCount: 0
    };
  } catch (error) {
    console.error('Erreur lors de la création du projet dans Notion:', error);
    return null;
  }
};
