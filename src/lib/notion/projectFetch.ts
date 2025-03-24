
/**
 * Project fetch functions
 */
import type { Project, SamplePage } from '../types';
import { notionClient } from './notionClient';
import { processSamplePage } from './utils';

/**
 * Fetch all projects from Notion
 */
export const getProjectsFromNotion = async (): Promise<Project[]> => {
  try {
    // Retrieve Notion integration configuration
    const { projectsDbId } = notionClient.getConfig();
    
    if (!projectsDbId) {
      console.error('Projects database ID is missing from Notion config');
      return [];
    }
    
    // Query the projects database
    const response = await notionClient.databases.query({
      database_id: projectsDbId,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending',
        },
      ],
    });
    
    // Process and map the response to Project objects
    const projects: Project[] = response.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || 'Unnamed Project',
        url: properties.URL?.url || '',
        progress: properties.Progress?.number || 0,
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
        itemsCount: properties.ItemsCount?.number || 15,
        pagesCount: properties.PagesCount?.number || 0
      };
    });
    
    return projects;
  } catch (error) {
    console.error('Error fetching projects from Notion:', error);
    throw error;
  }
};

/**
 * Fetch a specific project by ID
 * @param projectId Notion page ID for the project
 */
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    if (!projectId) {
      console.error('Project ID is required');
      return null;
    }
    
    // Retrieve the project page from Notion
    const response = await notionClient.pages.retrieve({
      page_id: projectId,
    });
    
    if (!response) {
      console.error(`Project with ID ${projectId} not found`);
      return null;
    }
    
    const properties = response.properties as any;
    
    // Map the Notion page to a Project object
    const project: Project = {
      id: response.id,
      name: properties.Name?.title?.[0]?.plain_text || 'Unnamed Project',
      url: properties.URL?.url || '',
      progress: properties.Progress?.number || 0,
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      itemsCount: properties.ItemsCount?.number || 15,
      pagesCount: properties.PagesCount?.number || 0
    };
    
    // Fetch the project's sample pages
    const samplePages = await getProjectSamplePages(projectId);
    project.samplePages = samplePages;
    
    return project;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Fetch sample pages for a specific project
 * @param projectId Notion page ID for the project
 */
export const getProjectSamplePages = async (projectId: string): Promise<SamplePage[]> => {
  try {
    // Retrieve Notion integration configuration
    const { pagesDbId } = notionClient.getConfig();
    
    if (!pagesDbId) {
      console.error('Pages database ID is missing from Notion config');
      return [];
    }
    
    // Query the pages database for pages related to the project
    const response = await notionClient.databases.query({
      database_id: pagesDbId,
      filter: {
        property: 'Project',
        relation: {
          contains: projectId,
        },
      },
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    });
    
    // Process and map the response to SamplePage objects
    const pages: SamplePage[] = response.results.map((page: any, index: number) => {
      return processSamplePage(page, projectId, index);
    });
    
    return pages;
  } catch (error) {
    console.error(`Error fetching sample pages for project ${projectId}:`, error);
    throw error;
  }
};
