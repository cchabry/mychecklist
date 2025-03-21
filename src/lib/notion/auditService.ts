
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Audit, AuditItem } from './types';
// Nous importons directement depuis '../types' pour éviter l'erreur d'usage comme valeur
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
          const item: AuditItem = {
            id: relation.id,
            title: relation.title || '', 
            description: relation.description || '',
            category: relation.category || 'Accessibilité',
            subcategory: relation.subcategory || '',
            criteria: relation.criteria || '',
            profile: relation.profile || '',
            phase: relation.phase || '',
            effort: relation.effort || '',
            priority: relation.priority || '',
            requirementLevel: relation.requirementLevel || '',
            scope: relation.scope || '',
            consigne: relation.title || '',
            status: relation.status || ComplianceStatus.NotEvaluated,
            comment: relation.comment || '',
            pageResults: [],
            actions: [], 
            metaRefs: relation.metaRefs || '',
            details: relation.details || ''
          };
          return item;
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
      name: getRichTextValue(properties.name) || getRichTextValue(properties.Name) || `Audit - ${new Date().toLocaleDateString()}`,
      items: items,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      completedAt: getDateValue(properties.completedAt) || getDateValue(properties.CompletedAt),
      score: getNumberValue(properties.score) || getNumberValue(properties.Score) || 0,
      version: getRichTextValue(properties.version) || getRichTextValue(properties.Version) || '1.0'
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
    
    // Forcer la restauration du mode réel après cette opération si nécessaire
    const wasMockForced = notionApi.mockMode.isTemporarilyForcedReal(false);
    
    // Créer l'objet de propriétés pour la mise à jour
    const properties = {
      score: {
        number: audit.score
      },
      updatedAt: {
        date: {
          start: new Date().toISOString()
        }
      },
      version: {
        rich_text: [{
          type: 'text',
          text: {
            content: audit.version || '1.0'
          }
        }]
      }
    };
    
    // Update the audit page
    await notionApi.pages.update(
      audit.id,
      { properties },
      apiKey
    );
    
    // Update individual items
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
      
      // Sauvegarde des actions correctives si présentes
      if (item.actions && item.actions.length > 0) {
        console.log(`Sauvegarde de ${item.actions.length} actions correctives pour l'item:`, item.id);
        
        // Pour le prototype, nous ne faisons pas de vraie sauvegarde des actions,
        // mais nous pourrions ajouter ce code ici pour la version finale
      }
    }
    
    // Restaurer le mode mock si nécessaire
    if (wasMockForced) {
      notionApi.mockMode.restoreAfterForceReal(wasMockForced);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'audit:', error);
    return false;
  }
};
