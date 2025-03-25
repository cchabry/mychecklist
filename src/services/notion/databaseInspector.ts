
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

export interface DatabaseProperty {
  name: string;
  type: string;
  required: boolean;
}

export interface DatabaseRequirements {
  name: string;
  properties: DatabaseProperty[];
}

export interface DatabaseValidationResult {
  databaseId: string;
  databaseName: string;
  isValid: boolean;
  missingProperties: string[];
  incorrectTypes: Array<{property: string, expected: string, actual: string}>;
  fullStructure?: Record<string, any>;
}

/**
 * Les exigences de structure pour chaque type de base de données
 */
const DATABASE_REQUIREMENTS: Record<string, DatabaseRequirements> = {
  projects: {
    name: 'Projets',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'URL', type: 'url', required: true },
      { name: 'Description', type: 'rich_text', required: false },
      { name: 'Status', type: 'select', required: false },
      { name: 'Progress', type: 'number', required: false }
    ]
  },
  checklists: {
    name: 'Checklist',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Description', type: 'rich_text', required: true },
      { name: 'Category', type: 'select', required: true },
      { name: 'Subcategory', type: 'select', required: false },
      { name: 'Reference', type: 'multi_select', required: false },
      { name: 'Profile', type: 'multi_select', required: false },
      { name: 'Phase', type: 'multi_select', required: false },
      { name: 'Effort', type: 'select', required: false },
      { name: 'Priority', type: 'select', required: false }
    ]
  },
  audits: {
    name: 'Audits',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Project', type: 'relation', required: true },
      { name: 'Score', type: 'number', required: false },
      { name: 'Version', type: 'rich_text', required: false }
    ]
  },
  pages: {
    name: 'Pages d\'échantillon',
    properties: [
      { name: 'Title', type: 'title', required: true },
      { name: 'URL', type: 'url', required: true },
      { name: 'Project', type: 'relation', required: true },
      { name: 'Description', type: 'rich_text', required: false },
      { name: 'Order', type: 'number', required: false }
    ]
  },
  exigences: {
    name: 'Exigences',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Project', type: 'relation', required: true },
      { name: 'Item', type: 'relation', required: true },
      { name: 'Importance', type: 'select', required: true },
      { name: 'Comment', type: 'rich_text', required: false }
    ]
  },
  evaluations: {
    name: 'Évaluations',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Audit', type: 'relation', required: true },
      { name: 'Page', type: 'relation', required: true },
      { name: 'Exigence', type: 'relation', required: true },
      { name: 'Score', type: 'select', required: true },
      { name: 'Comment', type: 'rich_text', required: false }
    ]
  },
  actions: {
    name: 'Actions correctives',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Evaluation', type: 'relation', required: true },
      { name: 'Priority', type: 'select', required: true },
      { name: 'DueDate', type: 'date', required: false },
      { name: 'Responsible', type: 'rich_text', required: false },
      { name: 'Status', type: 'select', required: true }
    ]
  }
};

/**
 * Vérifie la structure d'une base de données Notion
 */
export async function validateDatabaseStructure(
  databaseId: string, 
  databaseType: string,
  apiKey?: string | null
): Promise<DatabaseValidationResult> {
  if (!databaseId) {
    throw new Error('ID de base de données manquant');
  }

  if (!databaseType || !DATABASE_REQUIREMENTS[databaseType]) {
    throw new Error(`Type de base de données inconnu: ${databaseType}`);
  }

  // Utiliser la clé d'API fournie ou celle stockée dans localStorage
  const key = apiKey || localStorage.getItem('notion_api_key');
  if (!key) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    // Récupérer les informations de la base de données
    const dbInfo = await notionApi.databases.retrieve(databaseId, key);
    const requirements = DATABASE_REQUIREMENTS[databaseType];
    
    // Vérifier les propriétés
    const missingProperties: string[] = [];
    const incorrectTypes: Array<{property: string, expected: string, actual: string}> = [];

    requirements.properties.forEach(reqProp => {
      // Rechercher la propriété par nom (insensible à la casse)
      const foundProperty = Object.entries(dbInfo.properties).find(
        ([propName, _]) => propName.toLowerCase() === reqProp.name.toLowerCase()
      );

      if (!foundProperty) {
        if (reqProp.required) {
          missingProperties.push(reqProp.name);
        }
      } else {
        const [actualName, propDetails] = foundProperty;
        const actualType = propDetails.type;
        
        // Vérifier le type
        if (actualType !== reqProp.type) {
          incorrectTypes.push({
            property: actualName,
            expected: reqProp.type,
            actual: actualType
          });
        }
      }
    });

    // Préparer le résultat
    const result: DatabaseValidationResult = {
      databaseId,
      databaseName: dbInfo.title.map(t => t.plain_text).join('') || databaseType,
      isValid: missingProperties.length === 0 && incorrectTypes.length === 0,
      missingProperties,
      incorrectTypes,
      fullStructure: dbInfo.properties
    };

    return result;
  } catch (error) {
    console.error(`Erreur lors de la validation de la base de données ${databaseType}:`, error);
    throw error;
  }
}

/**
 * Vérifie la structure de toutes les bases de données configurées
 */
export async function validateAllDatabases(): Promise<Record<string, DatabaseValidationResult>> {
  const results: Record<string, DatabaseValidationResult> = {};
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    toast.error('Clé API Notion manquante');
    throw new Error('Clé API Notion manquante');
  }

  // Récupérer tous les IDs de base de données configurés
  const databaseConfigs: Record<string, string> = {
    projects: localStorage.getItem('notion_database_id') || '',
    checklists: localStorage.getItem('notion_checklists_database_id') || '',
    audits: localStorage.getItem('notion_audit_database_id') || '',
    pages: localStorage.getItem('notion_pages_database_id') || '',
    exigences: localStorage.getItem('notion_exigences_database_id') || '',
    evaluations: localStorage.getItem('notion_evaluations_database_id') || '',
    actions: localStorage.getItem('notion_actions_database_id') || ''
  };

  // Valider chaque base de données configurée
  const validationPromises = Object.entries(databaseConfigs)
    .filter(([_, dbId]) => dbId) // Ignorer les bases non configurées
    .map(async ([dbType, dbId]) => {
      try {
        const result = await validateDatabaseStructure(dbId, dbType, apiKey);
        results[dbType] = result;
      } catch (error) {
        console.error(`Erreur de validation pour ${dbType}:`, error);
        results[dbType] = {
          databaseId: dbId,
          databaseName: DATABASE_REQUIREMENTS[dbType]?.name || dbType,
          isValid: false,
          missingProperties: [],
          incorrectTypes: [],
          fullStructure: { error: String(error) }
        };
      }
    });

  await Promise.all(validationPromises);
  return results;
}
