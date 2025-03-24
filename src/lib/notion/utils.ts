
import { SamplePage } from '@/lib/types';

/**
 * Process a Notion page response to a SamplePage object
 * @param page Notion page response object
 * @param projectId ID of the project the page belongs to
 * @param index Index of the page in the results (used for order if not specified)
 */
export const processSamplePage = (page: any, projectId: string, index: number): SamplePage => {
  const properties = page.properties;
  
  return {
    id: page.id,
    projectId: projectId,
    url: properties.URL?.url || 
         properties.url?.url || 
         properties.Url?.url || '',
    title: properties.Title?.title?.[0]?.plain_text || 
           properties.title?.title?.[0]?.plain_text || 
           properties.Name?.title?.[0]?.plain_text || 
           `Page ${index + 1}`,
    description: properties.Description?.rich_text?.[0]?.plain_text || 
                 properties.description?.rich_text?.[0]?.plain_text || '',
    order: properties.Order?.number || 
           properties.order?.number || 
           index
  };
};
