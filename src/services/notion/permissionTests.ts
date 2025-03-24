
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';

export async function runPermissionTests(
  apiKey: string | null,
  projectsDbId: string | null,
  initialTests: TestResult[],
  persistCreatedPage: boolean,
  onPageCreated?: (pageInfo: {id: string; title: string}) => void
): Promise<TestResult[]> {
  if (!apiKey || !projectsDbId) {
    return initialTests;
  }
  
  const permissionResults = [...initialTests];
  
  // Test de lecture
  try {
    const dbInfo = await notionApi.databases.retrieve(projectsDbId, apiKey);
    
    if (dbInfo && dbInfo.id) {
      permissionResults[0] = { 
        ...initialTests[0], 
        status: 'success',
        details: `Accès en lecture confirmé: ${dbInfo.title?.[0]?.plain_text || dbInfo.id}`
      };
      
      // Analyser les propriétés de la base de données
      const properties = dbInfo.properties || {};
      const propsSummary = Object.entries(properties)
        .map(([name, prop]) => `${name} (${prop.type})`)
        .join(', ');
      
      console.log(`📊 Structure de la base de données: ${propsSummary}`);
    } else {
      permissionResults[0] = { 
        ...initialTests[0], 
        status: 'error',
        details: 'Échec de lecture: Réponse invalide'
      };
    }
  } catch (readError) {
    console.error('❌ Erreur de lecture de la base:', readError);
    permissionResults[0] = { 
      ...initialTests[0], 
      status: 'error',
      details: `Échec de lecture: ${readError.message || 'Erreur inconnue'}`
    };
  }
  
  // Test d'écriture
  try {
    const timestamp = new Date().toISOString();
    const testTitle = `Test diagnostique ${timestamp}`;
    
    // Récupérer la structure de la base de données pour découvrir le nom de la propriété titre
    console.log('🔍 Analyse de la structure de la base de données pour le test d\'écriture...');
    const dbDetails = await notionApi.databases.retrieve(projectsDbId, apiKey);
    
    // Trouver la propriété de type 'title'
    const properties = dbDetails.properties || {};
    const titleProperty = Object.entries(properties).find(([_, prop]) => prop.type === 'title')?.[0] || 'Name';
    
    console.log(`📝 Propriété titre identifiée: "${titleProperty}"`);
    
    // Préparer les données avec la propriété titre correcte
    const createData: any = {
      parent: { database_id: projectsDbId },
      properties: {}
    };
    
    // Ajouter la propriété titre
    createData.properties[titleProperty] = {
      title: [{ text: { content: testTitle } }]
    };
    
    // Ajouter d'autres propriétés communes potentiellement requises
    for (const [name, prop] of Object.entries(properties)) {
      if (name === titleProperty) continue; // Déjà ajouté
      
      if (prop.type === 'rich_text') {
        createData.properties[name] = { 
          rich_text: [{ text: { content: "Test de création via l'outil diagnostique" } }] 
        };
        console.log(`📝 Ajout de propriété rich_text: "${name}"`);
      } 
      else if (prop.type === 'select' && prop.select?.options?.length > 0) {
        createData.properties[name] = { 
          select: { name: prop.select.options[0].name } 
        };
        console.log(`🔽 Ajout de propriété select: "${name}" = "${prop.select.options[0].name}"`);
      }
      else if (prop.type === 'url') {
        createData.properties[name] = { 
          url: "https://tests.example.com/diagnostic" 
        };
        console.log(`🔗 Ajout de propriété url: "${name}"`);
      }
      else if (prop.type === 'number') {
        createData.properties[name] = { 
          number: 42
        };
        console.log(`🔢 Ajout de propriété number: "${name}"`);
      }
      else if (prop.type === 'checkbox') {
        createData.properties[name] = { 
          checkbox: false
        };
        console.log(`✓ Ajout de propriété checkbox: "${name}"`);
      }
    }
    
    console.log('📊 Données préparées pour l\'écriture:', JSON.stringify(createData, null, 2));
    
    // Effectuer la requête de création
    console.log('🔄 Envoi de la requête de création...');
    const createdPage = await notionApi.pages.create(createData, apiKey);
    
    if (createdPage && createdPage.id) {
      console.log(`✅ Page créée avec succès! ID: ${createdPage.id}`);
      
      let successMessage = `Test d'écriture réussi: Page créée avec ID ${createdPage.id.substring(0, 8)}...`;
      
      if (!persistCreatedPage) {
        try {
          console.log('🧹 Archivage de la page de test...');
          await notionApi.pages.update(createdPage.id, {
            archived: true
          }, apiKey);
          successMessage += " (page archivée)";
          console.log('✅ Page archivée avec succès');
        } catch (archiveError) {
          console.error('❌ Erreur lors de l\'archivage:', archiveError);
          successMessage += " (impossible d'archiver la page)";
        }
      } else {
        if (onPageCreated) {
          onPageCreated({
            id: createdPage.id,
            title: testTitle
          });
        }
        successMessage += " (page conservée dans la base de données)";
      }
      
      permissionResults[1] = { 
        ...initialTests[1], 
        status: 'success',
        details: successMessage
      };
    } else {
      console.error('❌ Réponse de création invalide:', createdPage);
      permissionResults[1] = { 
        ...initialTests[1], 
        status: 'error',
        details: 'Échec d\'écriture: Réponse invalide'
      };
    }
  } catch (writeError) {
    console.error('❌ Erreur lors de l\'écriture:', writeError);
    permissionResults[1] = { 
      ...initialTests[1], 
      status: 'error',
      details: `Échec d'écriture: ${writeError.message || 'Erreur inconnue'}`
    };
  }
  
  return permissionResults;
}
