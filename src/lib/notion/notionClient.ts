
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
    
    // Test de connexion à l'API Notion via la fonction Netlify
    try {
      // Tester directement la fonction Netlify au lieu d'appeler l'API Notion
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/users/me',
          method: 'GET',
          token: apiKey
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }
      
      const user = await response.json();
      
      // Tester aussi l'accès aux bases de données
      let projectsDbName = '';
      let checklistsDbName = '';
      
      // Test d'accès à la base de données des projets
      try {
        const dbResponse = await fetch('/.netlify/functions/notion-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: `/databases/${dbId}`,
            method: 'GET',
            token: apiKey
          })
        });
        
        if (!dbResponse.ok) {
          throw new Error(`Erreur ${dbResponse.status}: ${await dbResponse.text()}`);
        }
        
        const dbInfo = await dbResponse.json();
        projectsDbName = dbInfo.title?.[0]?.plain_text || dbId;
      } catch (dbError) {
        console.error('❌ Échec de l\'accès à la base de données des projets:', dbError);
        return { 
          success: false, 
          error: 'Échec de l\'accès à la base de données des projets',
          details: dbError.message
        };
      }
      
      // Test d'accès à la base de données des checklists si configurée
      if (checklistsDbId) {
        try {
          const checklistDbResponse = await fetch('/.netlify/functions/notion-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: `/databases/${checklistsDbId}`,
              method: 'GET',
              token: apiKey
            })
          });
          
          if (!checklistDbResponse.ok) {
            throw new Error(`Erreur ${checklistDbResponse.status}: ${await checklistDbResponse.text()}`);
          }
          
          const checklistDbInfo = await checklistDbResponse.json();
          checklistsDbName = checklistDbInfo.title?.[0]?.plain_text || checklistsDbId;
        } catch (checklistDbError) {
          console.error('❌ Échec de l\'accès à la base de données des checklists:', checklistDbError);
          return { 
            success: false, 
            error: 'Échec de l\'accès à la base de données des checklists',
            details: checklistDbError.message,
            projectsDbAccess: true
          };
        }
      }
      
      // Test réussi
      console.log('✅ Test de connexion à Notion réussi avec l\'utilisateur:', user.name);
      
      return { 
        success: true,
        user: user.name || 'Utilisateur Notion',
        projectsDbName,
        checklistsDbName: checklistsDbName || '(Non configurée)',
        hasChecklistsDb: !!checklistsDbName
      };
    } catch (error) {
      console.error('❌ Erreur lors du test de connexion Notion:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion à Notion'
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion Notion:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur de connexion à Notion'
    };
  }
};
