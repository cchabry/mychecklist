import { Client } from '@notionhq/client';
import { 
  PageObjectResponse, 
  PropertyItemObjectResponse,
  RichTextItemResponse,
  CreatePageResponse
} from '@notionhq/client/build/src/api-endpoints';
import { ComplianceStatus, Audit, AuditItem, Project } from './types';

let notionClient: Client | null = null;
let databaseId: string | null = null;

export const isNotionConfigured = (): boolean => {
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  return !!apiKey && !!dbId;
};

export const configureNotion = (apiKey: string, dbId: string): boolean => {
  try {
    console.log('Configuring Notion client with database ID:', dbId);
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

export const getProjectsFromNotion = async (): Promise<Project[] | null> => {
  if (!notionClient || !databaseId) {
    // Si Notion n'est pas configuré, initialiser avec les valeurs du localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) return null;
    
    notionClient = new Client({ auth: apiKey });
    databaseId = dbId;
  }
  
  try {
    console.log('Fetching projects from Notion, database ID:', databaseId);
    
    const response = await notionClient.databases.query({
      database_id: databaseId
    });
    
    console.log('Notion response:', response.results.length, 'results');
    
    if (response.results.length === 0) return [];
    
    // Convertir les résultats Notion en projets
    const projects: Project[] = [];
    
    for (const page of response.results as PageObjectResponse[]) {
      if (!('properties' in page)) continue;
      
      const properties = page.properties;
      console.log('Processing page with properties:', Object.keys(properties));
      
      // Helper functions pour extraire les valeurs des propriétés
      const getRichTextValue = (prop: any): string => {
        if (prop && prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
          return prop.rich_text[0].plain_text;
        }
        return '';
      };
      
      const getTitleValue = (prop: any): string => {
        if (prop && prop.type === 'title' && prop.title && prop.title.length > 0) {
          return prop.title[0].plain_text;
        }
        return '';
      };
      
      const getUrlValue = (prop: any): string => {
        if (prop && prop.type === 'url' && prop.url !== undefined) {
          return prop.url;
        }
        return '';
      };
      
      const getNumberValue = (prop: any): number => {
        if (prop && prop.type === 'number' && prop.number !== undefined) {
          return prop.number;
        }
        return 0;
      };
      
      // Créer l'objet projet
      try {
        const project: Project = {
          id: getRichTextValue(properties.id) || page.id, // Utiliser l'ID Notion comme fallback
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
    
    // Assure que nous avons une réponse de page complète
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    // Accéder aux propriétés avec vérification de type appropriée
    const properties = page.properties;
    
    // Fonction helper pour extraire le texte rich
    const getRichTextValue = (prop: any): string => {
      if (prop && prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
        return prop.rich_text[0].plain_text;
      }
      return '';
    };
    
    // Fonction helper pour extraire le titre
    const getTitleValue = (prop: any): string => {
      if (prop && prop.type === 'title' && prop.title && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
      return '';
    };
    
    // Fonction helper pour extraire l'URL
    const getUrlValue = (prop: any): string => {
      if (prop && prop.type === 'url' && prop.url !== undefined) {
        return prop.url;
      }
      return '';
    };
    
    // Fonction helper pour extraire le nombre
    const getNumberValue = (prop: any): number => {
      if (prop && prop.type === 'number' && prop.number !== undefined) {
        return prop.number;
      }
      return 0;
    };
    
    // Adapter le format Notion au format de l'app
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
    
    // Assure que nous avons une réponse de page complète
    const page = response.results[0] as PageObjectResponse;
    
    if (!('properties' in page)) {
      console.error('Invalid page response from Notion');
      return null;
    }
    
    const properties = page.properties;
    
    // Fonctions helper pour accéder aux propriétés de manière sûre
    const getRichTextValue = (prop: any): string => {
      if (prop && prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
        return prop.rich_text[0].plain_text;
      }
      return '';
    };
    
    const getNumberValue = (prop: any): number => {
      if (prop && prop.type === 'number' && prop.number !== undefined) {
        return prop.number;
      }
      return 0;
    };
    
    const getDateValue = (prop: any): string | null => {
      if (prop && prop.type === 'date' && prop.date && prop.date.start) {
        return prop.date.start;
      }
      return null;
    };
    
    const getRelationItems = (prop: any): AuditItem[] => {
      if (prop && prop.type === 'relation' && Array.isArray(prop.relation)) {
        return prop.relation.map((relation: any) => {
          // Adapter pour le nouveau format d'item
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
    
    // Récupérer les items
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

export const createProjectInNotion = async (name: string, url: string): Promise<Project | null> => {
  if (!notionClient || !databaseId) {
    const apiKey = localStorage.getItem('notion_api_key');
    const dbId = localStorage.getItem('notion_database_id');
    
    if (!apiKey || !dbId) return null;
    
    notionClient = new Client({ auth: apiKey });
    databaseId = dbId;
  }
  
  try {
    console.log('Creating project in Notion:', { name, url, databaseId });
    
    // Générer un ID unique pour le projet
    const projectId = `project-${Date.now()}`;
    const creationTime = new Date().toISOString();
    
    // Créer une nouvelle page (projet) dans la base de données Notion
    const response = await notionClient.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        // Adapter ces propriétés en fonction de la structure de votre base de données
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
    
    // Retourner le projet créé avec les timestamps actuels
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
