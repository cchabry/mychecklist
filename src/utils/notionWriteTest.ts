
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

// Interface pour les données de création d'une page Notion
export interface NotionCreateData {
  parent: { database_id: string };
  properties: {
    Name: { title: { text: { content: string } }[] };
    Status: { select: { name: string } };
    [key: string]: any; // Permettre des propriétés dynamiques supplémentaires
  };
}

/**
 * Génère les données pour un test d'écriture Notion
 */
export const createTestPageData = (timestamp: string): NotionCreateData => {
  const testTitle = `Test d'écriture ${timestamp}`;
  
  // Préparation des données de base pour la création de page
  const createData: NotionCreateData = {
    parent: { database_id: '' }, // Sera rempli ultérieurement
    properties: {
      Name: {
        title: [{ text: { content: testTitle } }]
      },
      Status: {
        select: { name: "Test" }
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
    
    createData.properties.Tags = {
      multi_select: [{ name: "Test" }]
    };
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
    
    // Analyser les propriétés requises de la base de données
    const requiredProps = Object.entries(dbDetails.properties)
      .filter(([_, prop]: [string, any]) => prop.type === 'title' || (prop.type === 'rich_text' && prop.rich_text?.is_required))
      .map(([name, _]: [string, any]) => name);
      
    console.log('⚠️ Propriétés potentiellement requises dans la base:', requiredProps);
    
    // Assurer que toutes les propriétés requises sont présentes
    if (requiredProps.length > 0) {
      const enrichedData = { ...createData };
      
      for (const propName of requiredProps) {
        if (!enrichedData.properties[propName]) {
          if (propName === 'Name' || propName === 'Nom' || propName === 'Title' || propName === 'Titre') {
            // Déjà défini comme Name, mais peut-être que la base utilise un nom différent
            enrichedData.properties[propName] = enrichedData.properties.Name;
            console.log(`🔄 Ajout de la propriété requise "${propName}" (copie de Name)`);
          } else {
            // Ajouter une valeur par défaut pour cette propriété requise
            enrichedData.properties[propName] = {
              rich_text: [{ text: { content: "Valeur de test requise" } }]
            };
            console.log(`🔄 Ajout de valeur par défaut pour la propriété requise "${propName}"`);
          }
        }
      }
      
      return enrichedData;
    }
  } catch (dbError) {
    console.error('❌ Erreur lors de la vérification de la structure de la base:', dbError);
  }
  
  // Si nous n'avons pas pu enrichir les données, retourner les données originales
  return createData;
};
