
/**
 * Utility functions for Notion integration
 */

import { SamplePage } from '../types';

/**
 * Clean up and normalize a project ID
 * Removes any surrounding quotes or formatting issues
 */
export const cleanProjectId = (id: string | undefined): string => {
  if (!id) {
    console.error("Project ID is missing or undefined");
    return '';
  }
  
  console.log(`Cleaning project ID: "${id}"`);
  
  // If it's already a clean string, return it
  if (typeof id === 'string' && !id.startsWith('"')) {
    return id;
  }
  
  // Try to parse if it looks like a JSON string
  try {
    if (typeof id === 'string' && 
        id.startsWith('"') && 
        id.endsWith('"')) {
      const cleanedId = JSON.parse(id);
      console.log(`ID cleaned from JSON: "${id}" => "${cleanedId}"`);
      return cleanedId;
    }
  } catch (e) {
    console.error(`Error cleaning project ID: "${id}"`, e);
  }
  
  // Return as is if we couldn't clean it
  return id;
};

/**
 * Transform a Notion page response into a SamplePage object
 */
export const processSamplePage = (notionPage: any, projectId: string, index: number = 0): SamplePage => {
  if (!notionPage) {
    return {
      id: `sample-${Date.now()}-${index}`,
      projectId,
      url: '',
      title: `Page ${index + 1}`,
      description: '',
      order: index
    };
  }
  
  // Extract properties from the Notion response
  const pageProperties = notionPage.properties || {};
  
  return {
    id: notionPage.id,
    projectId,
    url: pageProperties.URL?.url || pageProperties.url?.url || '',
    title: pageProperties.Title?.title?.[0]?.plain_text || 
           pageProperties.title?.title?.[0]?.plain_text || 
           `Page ${index + 1}`,
    description: pageProperties.Description?.rich_text?.[0]?.plain_text || '',
    order: pageProperties.Order?.number || index
  };
};
