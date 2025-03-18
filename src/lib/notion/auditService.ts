
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Audit, AuditItem, ComplianceStatus } from './types';
import { getNotionClient, notionPropertyExtractors } from './notionClient';

/**
 * Gets the audit for a specific project
 */
export const getAuditForProject = async (projectId: string): Promise<Audit | null> => {
  const { client, dbId } = getNotionClient();
  if (!client || !dbId) return null;
  
  try {
    // Retrieve audit data
    const response = await client.databases.query({
      database_id: dbId,
      filter: {
        property: 'projectId',
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
    const { getRichTextValue, getNumberValue, getDateValue } = notionPropertyExtractors;
    
    // Function to get relation items
    const getRelationItems = (prop: any): AuditItem[] => {
      if (prop && prop.type === 'relation' && Array.isArray(prop.relation)) {
        return prop.relation.map((relation: any) => {
          // Adapt to new item format
          return {
            id: relation.id,
            title: relation.title || '', // Consigne
            description: relation.description || '',
            category: relation.category || 'Accessibilité',
            subcategory: relation.subcategory || '',
            subsubcategory: relation.subsubcategory || '',
            details: relation.details || '', // Résumé
            metaRefs: relation.metaRefs || '',
            criteria: relation.criteria || '',
            profile: relation.profile || '',
            phase: relation.phase || '',
            effort: relation.effort || '',
            priority: relation.priority || '',
            requirementLevel: relation.requirementLevel || '',
            scope: relation.scope || '',
            status: relation.status || ComplianceStatus.NotEvaluated
          } as AuditItem;
        });
      }
      return [];
    };
    
    // Get items
    const items = getRelationItems(properties.items);
    
    return {
      id: getRichTextValue(properties.id),
      projectId: projectId,
      items: items,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      completedAt: getDateValue(properties.completedAt),
      score: getNumberValue(properties.score)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'audit:', error);
    return null;
  }
};

/**
 * Saves an audit to Notion
 */
export const saveAuditToNotion = async (audit: Audit): Promise<boolean> => {
  const { client, dbId } = getNotionClient();
  if (!client || !dbId) return false;
  
  try {
    // Update the audit page
    await client.pages.update({
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
    
    // Update individual items
    for (const item of audit.items) {
      await client.pages.update({
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
