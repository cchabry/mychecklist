
import { notionApi } from '../notionProxy';

export const getNotionClient = () => {
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_database_id');
  const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
  
  // Si l'API key ou l'ID de la base de données n'est pas défini, retourner null
  if (!apiKey || !dbId) {
    return { client: null, dbId: null, checklistsDbId: null };
  }
  
  return {
    client: apiKey, // On utilise la clé API comme "client" pour le proxy
    dbId,
    checklistsDbId
  };
};

export const notionPropertyExtractors = {
  getRichTextValue: (property: any): string => {
    if (!property || property.type !== 'rich_text') return '';
    
    if (Array.isArray(property.rich_text) && property.rich_text.length > 0) {
      return property.rich_text.map((rt: any) => rt.plain_text).join('');
    }
    
    return '';
  },
  
  getNumberValue: (property: any): number => {
    if (!property || property.type !== 'number') return 0;
    return property.number || 0;
  },
  
  getDateValue: (property: any): string | null => {
    if (!property || property.type !== 'date' || !property.date) return null;
    return property.date.start || null;
  },
  
  getSelectValue: (property: any): string => {
    if (!property || property.type !== 'select' || !property.select) return '';
    return property.select.name || '';
  }
};

export const testNotionConnection = async () => {
  try {
    const { client: apiKey, dbId, checklistsDbId } = getNotionClient();
    
    if (!apiKey || !dbId) {
      return { success: false, error: 'Configuration Notion manquante' };
    }
    
    // Test de connexion à l'API Notion
    const user = await notionApi.users.me(apiKey);
    
    // Tentative d'accès à la base de données des projets
    let projectsDbName = '';
    try {
      const dbResponse = await notionApi.databases.retrieve(dbId, apiKey);
      projectsDbName = dbResponse.title?.[0]?.plain_text || dbId;
    } catch (dbError) {
      return { 
        success: false, 
        error: 'Échec de l\'accès à la base de données des projets',
        details: dbError.message
      };
    }
    
    // Si un ID de base de données pour les checklists est fourni, tester aussi son accès
    let checklistsDbName = '';
    if (checklistsDbId) {
      try {
        const checklistDbResponse = await notionApi.databases.retrieve(checklistsDbId, apiKey);
        checklistsDbName = checklistDbResponse.title?.[0]?.plain_text || checklistsDbId;
      } catch (checklistDbError) {
        return { 
          success: false, 
          error: 'Échec de l\'accès à la base de données des checklists',
          details: checklistDbError.message,
          projectsDbAccess: true // L'accès à la base de données des projets a réussi
        };
      }
    }
    
    return { 
      success: true,
      user: user.name || 'Utilisateur Notion',
      projectsDbName,
      checklistsDbName: checklistsDbName || '(Non configurée)',
      hasChecklistsDb: !!checklistsDbName
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Erreur de connexion à Notion'
    };
  }
};
