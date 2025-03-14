
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { ComplianceStatus, Audit, AuditItem } from './types';

let notionClient: Client | null = null;
let databaseId: string | null = null;

export const isNotionConfigured = (): boolean => {
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  return !!apiKey && !!dbId;
};

export const configureNotion = (apiKey: string, dbId: string): boolean => {
  try {
    notionClient = new Client({ auth: apiKey });
    databaseId = dbId;
    
    // Stocker dans localStorage
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', dbId);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration Notion:', error);
    return false;
  }
};

export const getProjectById = async (projectId: string) => {
  if (!notionClient || !databaseId) return null;
  
  try {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      filter: {
        property: 'id',
        rich_text: {
          equals: projectId
        }
      }
    });
    
    if (response.results.length === 0) return null;
    
    // Assure that we have a full page object response
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    const properties = page.properties;
    
    // Adapter le format Notion au format de l'app
    return {
      id: properties.id?.rich_text?.[0]?.plain_text || '',
      name: properties.name?.title?.[0]?.plain_text || '',
      url: properties.url?.url || '',
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      progress: properties.progress?.number || 0,
      itemsCount: properties.itemsCount?.number || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return null;
  }
};

export const getAuditForProject = async (projectId: string) => {
  if (!notionClient || !databaseId) return null;
  
  try {
    // Récupérer les données d'audit
    const response = await notionClient.databases.query({
      database_id: databaseId,
      filter: {
        property: 'projectId',
        rich_text: {
          equals: projectId
        }
      }
    });
    
    if (response.results.length === 0) return null;
    
    // Assure that we have a full page object response
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    const properties = page.properties;
    
    // Récupérer les items
    const items: AuditItem[] = properties.items?.relation?.map(relation => {
      const item = {
        id: relation.id,
        title: relation.title || '',
        description: relation.description || '',
        category: relation.category || 'Accessibilité',
        status: relation.status || ComplianceStatus.NotEvaluated
      } as AuditItem;
      return item;
    }) || [];
    
    return {
      id: properties.id?.rich_text?.[0]?.plain_text || '',
      projectId: projectId,
      items: items,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      completedAt: properties.completedAt?.date?.start || null,
      score: properties.score?.number || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'audit:', error);
    return null;
  }
};

export const saveAuditToNotion = async (audit: Audit): Promise<boolean> => {
  if (!notionClient || !databaseId) return false;
  
  try {
    // Mise à jour de la page d'audit
    await notionClient.pages.update({
      page_id: audit.id,
      properties: {
        score: {
          number: audit.score
        },
        updatedAt: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });
    
    // Mise à jour des items individuels
    for (const item of audit.items) {
      await notionClient.pages.update({
        page_id: item.id,
        properties: {
          status: {
            select: {
              name: item.status
            }
          },
          comment: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: item.comment || ''
                }
              }
            ]
          }
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'audit:', error);
    return false;
  }
};
