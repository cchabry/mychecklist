
import { notionClient, NotionAPIListResponse, NotionAPIPage } from '../client';
import { mapNotionToChecklistItem } from './mappers';

/**
 * Récupère tous les items de checklist depuis l'API Notion
 */
export const fetchAllChecklistItems = async (checklistDbId: string) => {
  if (!notionClient.isConfigured()) {
    throw new Error('Client Notion non configuré');
  }
  
  // Faire la requête à l'API Notion
  const response = await notionClient.post<NotionAPIListResponse>(`/databases/${checklistDbId}/query`, {});
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Échec de la récupération des items de checklist');
  }
  
  return response.data.results;
};

/**
 * Récupère un item de checklist spécifique depuis l'API Notion
 */
export const fetchChecklistItem = async (id: string) => {
  if (!notionClient.isConfigured()) {
    throw new Error('Client Notion non configuré');
  }
  
  // Faire la requête à l'API Notion
  const response = await notionClient.get<NotionAPIPage>(`/pages/${id}`);
  
  if (!response.success) {
    console.error('Erreur Notion lors de la récupération de l\'item de checklist:', response.error);
    return null;
  }
  
  return response.data;
};
