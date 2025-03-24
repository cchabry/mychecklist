
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Audit, AuditItem } from './types';
// Nous importons directement depuis '../types' pour éviter l'erreur d'usage comme valeur
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
            status: relation.status || 'non-évalué',
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
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      completedAt: getDateValue(properties.completedAt) || getDateValue(properties.CompletedAt),
      items: items, // Ajout du champ items
      score: getNumberValue(properties.score) || getNumberValue(properties.Score) || 0, // Ajout du champ score
      version: getRichTextValue(properties.version) || getRichTextValue(properties.Version) || '1.0' // Ajout du champ version
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
      updatedAt: {
        date: {
          start: new Date().toISOString()
        }
      }
    };
    
    // Update the audit page using fetch directly instead of request
    const response = await fetch(`https://api.notion.com/v1/pages/${audit.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour: ${response.status} ${response.statusText}`);
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
