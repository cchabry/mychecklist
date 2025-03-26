
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';

export async function runStructureTests(
  apiKey: string | null,
  projectsDbId: string | null,
  checklistsDbId: string | null,
  initialTests: TestResult[]
): Promise<TestResult[]> {
  if (!apiKey || !projectsDbId) {
    return initialTests;
  }
  
  const structureResults = [...initialTests];
  
  // Test de structure de la base de données Projets
  try {
    const dbInfo = await notionApi.databases.retrieve(projectsDbId, apiKey);
    
    if (dbInfo && dbInfo.properties) {
      const requiredProps = ['Name', 'Status', 'Description', 'URL'];
      const missingProps = requiredProps.filter(prop => 
        !Object.keys(dbInfo.properties).some(key => 
          key.toLowerCase() === prop.toLowerCase()
        )
      );
      
      if (missingProps.length === 0) {
        structureResults[0] = { 
          ...initialTests[0], 
          status: 'success',
          details: 'Structure de la base de données de projets valide'
        };
      } else {
        structureResults[0] = { 
          ...initialTests[0], 
          status: 'warning',
          details: `Propriétés manquantes: ${missingProps.join(', ')}`
        };
      }
    } else {
      structureResults[0] = { 
        ...initialTests[0], 
        status: 'error',
        details: 'Impossible de vérifier la structure: Réponse invalide'
      };
    }
  } catch (structureError) {
    structureResults[0] = { 
      ...initialTests[0], 
      status: 'error',
      details: `Erreur de vérification de structure: ${structureError.message || 'Erreur inconnue'}`
    };
  }
  
  // Test de structure de la base de données Checklists (si configurée)
  if (checklistsDbId) {
    try {
      const checklistDbInfo = await notionApi.databases.retrieve(checklistsDbId, apiKey);
      
      if (checklistDbInfo && checklistDbInfo.properties) {
        const requiredProps = ['Name', 'Category', 'Description'];
        const missingProps = requiredProps.filter(prop => 
          !Object.keys(checklistDbInfo.properties).some(key => 
            key.toLowerCase() === prop.toLowerCase()
          )
        );
        
        if (missingProps.length === 0) {
          structureResults[1] = { 
            ...initialTests[1], 
            status: 'success',
            details: 'Structure de la base de données de checklists valide'
          };
        } else {
          structureResults[1] = { 
            ...initialTests[1], 
            status: 'warning',
            details: `Propriétés manquantes: ${missingProps.join(', ')}`
          };
        }
      } else {
        structureResults[1] = { 
          ...initialTests[1], 
          status: 'error',
          details: 'Impossible de vérifier la structure: Réponse invalide'
        };
      }
    } catch (structureError) {
      structureResults[1] = { 
        ...initialTests[1], 
        status: 'error',
        details: `Erreur de vérification de structure: ${structureError.message || 'Erreur inconnue'}`
      };
    }
  } else {
    structureResults[1] = { 
      ...initialTests[1], 
      status: 'warning',
      details: 'Base de données de checklists non configurée (optionnelle)'
    };
  }
  
  return structureResults;
}
