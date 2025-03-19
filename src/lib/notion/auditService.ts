
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Audit, AuditItem } from './types';
import { ComplianceStatus, COMPLIANCE_VALUES } from '../types';
import { getNotionClient, notionPropertyExtractors } from './notionClient';
import { notionApi } from '@/lib/notionProxy';

/**
 * Gets the audit for a specific project
 */
export const getAuditForProject = async (projectId: string): Promise<Audit | null> => {
  const { client: apiKey, dbId } = getNotionClient();
  if (!apiKey || !dbId) return null;
  
  try {
    // Retrieve audit data
    const response = await notionApi.databases.query(
      dbId,
      {
        filter: {
          property: 'projectId',
          rich_text: {
            equals: projectId
          }
        }
      },
      apiKey
    );
    
    console.log('Résultats audit pour le projet:', projectId, response.results.length);
    
    if (response.results.length === 0) return null;
    
    // Ensure we have a complete page response
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    const properties = page.properties;
    console.log('Propriétés de l\'audit:', JSON.stringify(properties, null, 2));
    
    const { getRichTextValue, getNumberValue, getDateValue } = notionPropertyExtractors;
    
    // Function to get relation items
    const getRelationItems = (prop: any): AuditItem[] => {
      if (prop && prop.type === 'relation' && Array.isArray(prop.relation)) {
        console.log('Relation items count:', prop.relation.length);
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
    
    // Get items - essayer différentes clés possibles
    const items = getRelationItems(properties.items) || 
                   getRelationItems(properties.Items) || 
                   getRelationItems(properties.checklists) || 
                   getRelationItems(properties.Checklists) || 
                   [];
    
    return {
      id: getRichTextValue(properties.id) || page.id,
      projectId: projectId,
      items: items,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      completedAt: getDateValue(properties.completedAt) || getDateValue(properties.CompletedAt),
      score: getNumberValue(properties.score) || getNumberValue(properties.Score) || 0
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
  const { client: apiKey, dbId } = getNotionClient();
  if (!apiKey || !dbId) return false;
  
  try {
    console.log('Sauvegarde de l\'audit:', audit.id);
    
    // Créer l'objet de propriétés pour la mise à jour
    const properties = {
      score: {
        number: audit.score
      },
      updatedAt: {
        date: {
          start: new Date().toISOString()
        }
      }
    };
    
    // Update the audit page - Fixed to use the correct parameter order
    await notionApi.pages.update(
      audit.id,
      { properties },
      apiKey
    );
    
    // Update individual items - Fixed to use the correct parameter order
    for (const item of audit.items) {
      console.log('Mise à jour item:', item.id, item.status);
      
      const itemProperties = {
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
      };
      
      await notionApi.pages.update(
        item.id,
        itemProperties,
        apiKey
      );
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'audit:', error);
    return false;
  }
};
