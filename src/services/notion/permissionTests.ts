
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';
import { extractNotionDatabaseId } from '@/lib/notion';

export async function runPermissionTests(
  apiKey: string | null,
  projectsDbId: string | null,
  initialTests: TestResult[],
  persistCreatedPage = false,
  onPageCreated?: (pageInfo: {id: string; title: string}) => void
): Promise<TestResult[]> {
  if (!apiKey || !projectsDbId) {
    return initialTests;
  }
  
  const permissionResults = [...initialTests];
  
  // Test de lecture
  try {
    const cleanDbId = extractNotionDatabaseId(projectsDbId);
    const dbResponse = await notionApi.databases.retrieve(cleanDbId, apiKey);
    
    if (dbResponse && dbResponse.id) {
      permissionResults[0] = { 
        ...initialTests[0], 
        status: 'success',
        details: `Accès en lecture à la base de données: ${dbResponse.title?.[0]?.plain_text || cleanDbId}`
      };
    } else {
      permissionResults[0] = { 
        ...initialTests[0], 
        status: 'error',
        details: 'Échec de lecture: Réponse invalide'
      };
    }
  } catch (readError) {
    permissionResults[0] = { 
      ...initialTests[0], 
      status: 'error',
      details: `Échec de lecture: ${readError.message || 'Erreur inconnue'}`
    };
  }
  
  // Test d'écriture
  try {
    const cleanDbId = extractNotionDatabaseId(projectsDbId);
    const timestamp = new Date().toISOString();
    const testPageTitle = `Test de permission ${timestamp}`;
    
    // Préparation des données de test
    const testPageData = {
      parent: { database_id: cleanDbId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: testPageTitle
              }
            }
          ]
        },
        Description: {
          rich_text: [
            {
              text: {
                content: "Page de test créée pour vérifier les permissions d'écriture"
              }
            }
          ]
        }
      }
    };
    
    // Tenter de créer une page
    const pageResponse = await notionApi.pages.create(testPageData, apiKey);
    
    if (pageResponse && pageResponse.id) {
      permissionResults[1] = { 
        ...initialTests[1], 
        status: 'success',
        details: `Page "${testPageTitle}" créée avec succès (ID: ${pageResponse.id})`
      };
      
      // Notifier si demandé
      if (onPageCreated) {
        onPageCreated({
          id: pageResponse.id,
          title: testPageTitle
        });
      }
      
      // Archiver la page si on ne veut pas la conserver
      if (!persistCreatedPage) {
        try {
          await notionApi.pages.update(pageResponse.id, {
            archived: true
          }, apiKey);
          
          permissionResults[1].details += " (archivée)";
        } catch (archiveError) {
          permissionResults[1].details += ` (échec de l'archivage: ${archiveError.message || 'Erreur inconnue'})`;
        }
      }
    } else {
      permissionResults[1] = { 
        ...initialTests[1], 
        status: 'error',
        details: 'Échec d\'écriture: Réponse invalide'
      };
    }
  } catch (writeError) {
    permissionResults[1] = { 
      ...initialTests[1], 
      status: 'error',
      details: `Échec d'écriture: ${writeError.message || 'Erreur inconnue'}`
    };
  }
  
  return permissionResults;
}
