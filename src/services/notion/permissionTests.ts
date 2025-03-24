
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
    const timestamp = new Date().toISOString();
    const testTitle = `Test diagnostique ${timestamp}`;
    
    const createData = {
      parent: { database_id: projectsDbId },
      properties: {
        Name: {
          title: [{ text: { content: testTitle } }]
        },
        Status: { 
          select: { name: "Test" } 
        },
        Description: { 
          rich_text: [{ text: { content: "Test de création via l'outil diagnostique" } }] 
        },
        URL: { 
          url: "https://tests.example.com/diagnostic" 
        }
      }
    };
    
    const createdPage = await notionApi.pages.create(createData, apiKey);
    
    if (createdPage && createdPage.id) {
      let successMessage = `Test d'écriture réussi: Page créée avec ID ${createdPage.id.substring(0, 8)}...`;
      
      if (!persistCreatedPage) {
        try {
          await notionApi.pages.update(createdPage.id, {
            archived: true
          }, apiKey);
          successMessage += " (page archivée)";
        } catch (archiveError) {
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
