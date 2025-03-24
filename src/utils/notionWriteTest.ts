
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

// Interface pour les données de création d'une page Notion
export interface NotionCreateData {
  parent: { database_id: string };
  properties: {
    [key: string]: any; // Permettre des propriétés dynamiques
  };
}

/**
 * Génère les données pour un test d'écriture Notion
 */
export const createTestPageData = (timestamp: string): NotionCreateData => {
  const testTitle = `Test d'écriture ${timestamp}`;
  
  // Préparation des données de base pour la création de page avec un format générique
  // qui utilise 'Name' comme propriété de titre par défaut
  const createData: NotionCreateData = {
    parent: { database_id: '' }, // Sera rempli ultérieurement
    properties: {
      Name: {
        title: [{ text: { content: testTitle } }]
      }
    }
  };
  
  // Ajouter d'autres propriétés courantes qui pourraient être requises
  try {
    createData.properties.URL = {
      url: "https://test.example.com"
    };
    
    createData.properties.Description = {
      rich_text: [{ text: { content: "Description de test automatique" } }]
    };
    
    createData.properties.Status = {
      select: { name: "Test" }
    };
    
    createData.properties.Tags = {
      multi_select: [{ name: "Test" }]
    };
    
    // Variantes courantes des noms de propriétés
    createData.properties.Url = createData.properties.URL;
    createData.properties.url = createData.properties.URL;
    
    createData.properties.Titre = createData.properties.Name;
    createData.properties.Title = createData.properties.Name;
    createData.properties.title = createData.properties.Name;
    createData.properties.name = createData.properties.Name;
    
    createData.properties.description = createData.properties.Description;
    
    createData.properties.Status = {
      select: { name: "Test" }
    };
    
    createData.properties.status = createData.properties.Status;
    createData.properties.Statut = createData.properties.Status;
    createData.properties.statut = createData.properties.Status;
    
  } catch (e) {
    console.log('ℹ️ Certaines propriétés ne sont peut-être pas supportées');
  }
  
  return createData;
};

/**
 * Désactive temporairement le mode mock pour effectuer un test réel
 */
export const prepareRealModeTest = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
  localStorage.removeItem('notion_last_error');
  notionApi.mockMode.forceReset();
  console.log('🔄 Test d\'écriture: Mode réel forcé temporairement');
};

/**
 * Enrichit les données de création avec les propriétés requises de la base de données
 */
export const enrichWithRequiredProperties = async (
  createData: NotionCreateData, 
  dbId: string, 
  apiKey: string
): Promise<NotionCreateData> => {
  try {
    console.log('🔍 Vérification de la structure de la base de données avant création...');
    const dbDetails = await notionApi.databases.retrieve(dbId, apiKey);
    console.log('✅ Structure de la base de données récupérée');
    
    // Analyser les propriétés de la base de données
    const properties = dbDetails.properties || {};
    
    // Trouver la propriété de type 'title'
    const titleProperty = Object.entries(properties).find(([_, prop]) => prop.type === 'title')?.[0];
    
    if (titleProperty && titleProperty !== 'Name') {
      console.log(`🔄 Propriété titre identifiée: "${titleProperty}" (différente de "Name")`);
      
      // Copier la valeur de Name vers la propriété titre correcte
      if (createData.properties.Name) {
        createData.properties[titleProperty] = { ...createData.properties.Name };
        console.log(`🔄 Copie de la valeur Name vers "${titleProperty}"`);
      }
    } else {
      console.log('✅ Propriété titre "Name" correcte ou non trouvée');
    }
    
    // Analyser les propriétés potentiellement requises (rich_text avec is_required, etc.)
    const requiredProps = Object.entries(properties)
      .filter(([name, prop]: [string, any]) => {
        // Si c'est la propriété titre, elle est déjà gérée
        if (name === titleProperty) return false;
        
        // Si c'est un rich_text marqué comme requis
        if (prop.type === 'rich_text' && prop.rich_text?.is_required) return true;
        
        // Si c'est un select sans option par défaut et requis
        if (prop.type === 'select' && !prop.select?.default_option && prop.select?.is_required) return true;
        
        // Si c'est un url marqué comme requis
        if (prop.type === 'url' && prop.url?.is_required) return true;
        
        return false;
      })
      .map(([name, _]: [string, any]) => name);
      
    if (requiredProps.length > 0) {
      console.log('⚠️ Propriétés potentiellement requises dans la base:', requiredProps);
    }
    
    // Assurer que toutes les propriétés de la base ont une valeur valide
    // (même si elles ne sont pas explicitement requises)
    for (const [propName, propDetails] of Object.entries(properties)) {
      // Si la propriété existe déjà dans les données, ne pas la modifier
      if (createData.properties[propName]) {
        continue;
      }
      
      // Ajouter une valeur par défaut selon le type de propriété
      const propType = propDetails.type;
      
      if (propType === 'title') {
        if (propName !== titleProperty) {
          // C'est une propriété titre secondaire, copier le titre principal
          createData.properties[propName] = createData.properties[titleProperty] || {
            title: [{ text: { content: `Test ${new Date().toISOString()}` } }]
          };
          console.log(`🔄 Ajout de la propriété titre "${propName}" (copie de la principale)`);
        }
      } 
      else if (propType === 'rich_text') {
        createData.properties[propName] = {
          rich_text: [{ text: { content: "Valeur de test pour " + propName } }]
        };
        console.log(`🔄 Ajout de la propriété rich_text "${propName}"`);
      }
      else if (propType === 'select') {
        // Utiliser la première option disponible si elle existe
        const options = propDetails.select?.options || [];
        if (options.length > 0) {
          createData.properties[propName] = {
            select: { name: options[0].name }
          };
          console.log(`🔄 Ajout de la propriété select "${propName}" = "${options[0].name}"`);
        }
      }
      else if (propType === 'multi_select') {
        // Utiliser la première option disponible si elle existe
        const options = propDetails.multi_select?.options || [];
        if (options.length > 0) {
          createData.properties[propName] = {
            multi_select: [{ name: options[0].name }]
          };
          console.log(`🔄 Ajout de la propriété multi_select "${propName}" = "${options[0].name}"`);
        }
      }
      else if (propType === 'url') {
        createData.properties[propName] = {
          url: "https://test.example.com/" + propName
        };
        console.log(`🔄 Ajout de la propriété url "${propName}"`);
      }
      else if (propType === 'number') {
        createData.properties[propName] = {
          number: 42
        };
        console.log(`🔄 Ajout de la propriété number "${propName}"`);
      }
      else if (propType === 'checkbox') {
        createData.properties[propName] = {
          checkbox: false
        };
        console.log(`🔄 Ajout de la propriété checkbox "${propName}"`);
      }
      else if (propType === 'date') {
        createData.properties[propName] = {
          date: { start: new Date().toISOString() }
        };
        console.log(`🔄 Ajout de la propriété date "${propName}"`);
      }
      else if (propType === 'email') {
        createData.properties[propName] = {
          email: "test@example.com"
        };
        console.log(`🔄 Ajout de la propriété email "${propName}"`);
      }
      else if (propType === 'phone_number') {
        createData.properties[propName] = {
          phone_number: "+33123456789"
        };
        console.log(`🔄 Ajout de la propriété phone_number "${propName}"`);
      }
    }
    
    return createData;
  } catch (dbError) {
    console.error('❌ Erreur lors de la vérification de la structure de la base:', dbError);
  }
  
  // Si nous n'avons pas pu enrichir les données, retourner les données originales
  return createData;
};
