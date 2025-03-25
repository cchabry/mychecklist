
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

// Définition des types pour la validation des bases de données
export interface DatabaseProperty {
  name: string;
  type: string;
  required: boolean;
}

export interface DatabaseStructure {
  databaseId: string;
  name: string;
  properties: DatabaseProperty[];
}

export interface IncorrectTypeInfo {
  property: string;
  expected: string;
  actual: string;
}

export interface DatabaseValidationResult {
  databaseId: string;
  databaseName: string;
  isValid: boolean;
  missingProperties: string[];
  incorrectTypes: IncorrectTypeInfo[];
  fullStructure: Record<string, any>;
}

// Définition des structures attendues pour chaque base de données
const expectedDatabases: Record<string, DatabaseStructure> = {
  projects: {
    databaseId: 'projects',
    name: 'Projets',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'URL', type: 'url', required: true },
      { name: 'Status', type: 'select', required: true },
      { name: 'Description', type: 'rich_text', required: false },
    ]
  },
  checklist: {
    databaseId: 'checklist',
    name: 'Checklist',
    properties: [
      { name: 'Consigne', type: 'title', required: true },
      { name: 'Description', type: 'rich_text', required: true },
      { name: 'Catégorie', type: 'select', required: true },
      { name: 'Sous-catégorie', type: 'select', required: true },
      { name: 'Référence', type: 'multi_select', required: false },
      { name: 'Profil', type: 'multi_select', required: false },
      { name: 'Effort', type: 'select', required: true },
      { name: 'Priorité', type: 'select', required: true },
    ]
  },
  exigences: {
    databaseId: 'exigences',
    name: 'Exigences',
    properties: [
      { name: 'Project', type: 'relation', required: true },
      { name: 'Item', type: 'relation', required: true },
      { name: 'Importance', type: 'select', required: true },
      { name: 'Commentaire', type: 'rich_text', required: false },
    ]
  },
  pages: {
    databaseId: 'pages',
    name: 'Pages',
    properties: [
      { name: 'Title', type: 'title', required: true },
      { name: 'Project', type: 'relation', required: true },
      { name: 'URL', type: 'url', required: true },
      { name: 'Description', type: 'rich_text', required: false },
      { name: 'Order', type: 'number', required: false },
    ]
  },
  audits: {
    databaseId: 'audits',
    name: 'Audits',
    properties: [
      { name: 'Name', type: 'title', required: true },
      { name: 'Project', type: 'relation', required: true },
      { name: 'Date', type: 'date', required: true },
      { name: 'Status', type: 'select', required: true },
    ]
  },
  evaluations: {
    databaseId: 'evaluations',
    name: 'Évaluations',
    properties: [
      { name: 'Audit', type: 'relation', required: true },
      { name: 'Page', type: 'relation', required: true },
      { name: 'Exigence', type: 'relation', required: true },
      { name: 'Score', type: 'select', required: true },
      { name: 'Commentaire', type: 'rich_text', required: false },
    ]
  },
  actions: {
    databaseId: 'actions',
    name: 'Actions correctives',
    properties: [
      { name: 'Evaluation', type: 'relation', required: true },
      { name: 'Score cible', type: 'select', required: true },
      { name: 'Priorité', type: 'select', required: true },
      { name: 'Échéance', type: 'date', required: true },
      { name: 'Responsable', type: 'rich_text', required: true },
      { name: 'Statut', type: 'select', required: true },
    ]
  }
};

// Fonction pour valider une base de données
const validateDatabase = async (
  databaseId: string, 
  expectedStructure: DatabaseStructure
): Promise<DatabaseValidationResult> => {
  try {
    // Utiliser la fonction databases.retrieve au lieu de getDatabaseStructure
    const response = await notionApi.databases.retrieve(databaseId);
    
    // Utiliser une assertion de type avec vérification pour les propriétés de la réponse
    if (!response || typeof response !== 'object') {
      throw new Error(`Réponse invalide pour la base de données: ${databaseId}`);
    }
    
    const responseObj = response as Record<string, any>;
    const properties = responseObj.properties;
    
    if (!properties || typeof properties !== 'object') {
      throw new Error(`Structure de propriétés invalide pour la base de données: ${databaseId}`);
    }
    
    // Récupérer le nom de la base de données à partir du titre si disponible
    let databaseName = expectedStructure.name;
    if (responseObj.title && Array.isArray(responseObj.title)) {
      try {
        databaseName = responseObj.title
          .map((titlePart: any) => titlePart.plain_text || '')
          .join('');
      } catch (e) {
        // Utiliser le nom par défaut si on ne peut pas extraire le titre
      }
    }
    
    const missingProperties: string[] = [];
    const incorrectTypes: IncorrectTypeInfo[] = [];
    
    // Vérifier chaque propriété attendue
    for (const expectedProp of expectedStructure.properties) {
      if (!expectedProp.required) continue;
      
      const propExists = Object.entries(properties).some(
        ([_, propDetails]: [string, any]) => 
          propDetails.name === expectedProp.name
      );
      
      if (!propExists) {
        missingProperties.push(expectedProp.name);
        continue;
      }
      
      // Vérifier le type de la propriété
      const property = Object.entries(properties).find(
        ([_, propDetails]: [string, any]) => 
          propDetails.name === expectedProp.name
      );
      
      if (property) {
        const [_, propDetails] = property as [string, Record<string, any>];
        const actualType = propDetails.type;
        
        if (actualType !== expectedProp.type) {
          incorrectTypes.push({
            property: expectedProp.name,
            expected: expectedProp.type,
            actual: actualType
          });
        }
      }
    }
    
    return {
      databaseId,
      databaseName,
      isValid: missingProperties.length === 0 && incorrectTypes.length === 0,
      missingProperties,
      incorrectTypes,
      fullStructure: properties
    };
  } catch (error) {
    console.error(`Erreur lors de la validation de la base de données ${databaseId}:`, error);
    return {
      databaseId,
      databaseName: expectedStructure.name,
      isValid: false,
      missingProperties: [`Erreur d'accès à la base de données: ${error instanceof Error ? error.message : String(error)}`],
      incorrectTypes: [],
      fullStructure: {}
    };
  }
};

// Fonction pour récupérer les identifiants des bases de données depuis localStorage
const getDatabaseIds = (): Record<string, string> => {
  const configDatabaseIds: Record<string, string> = {};
  
  Object.keys(expectedDatabases).forEach(dbKey => {
    const storageKey = `notion_${dbKey}_database_id`;
    const dbId = localStorage.getItem(storageKey);
    if (dbId) {
      configDatabaseIds[dbKey] = dbId;
    }
  });
  
  // Cas spécial pour la base de données de projets
  if (!configDatabaseIds.projects) {
    const mainDbId = localStorage.getItem('notion_database_id');
    if (mainDbId) {
      configDatabaseIds.projects = mainDbId;
    }
  }
  
  return configDatabaseIds;
};

// Fonction principale pour valider toutes les bases de données
export const validateAllDatabases = async (): Promise<Record<string, DatabaseValidationResult>> => {
  const results: Record<string, DatabaseValidationResult> = {};
  
  // Récupérer les ID de bases de données depuis localStorage
  const configDatabaseIds = getDatabaseIds();
  
  if (Object.keys(configDatabaseIds).length === 0) {
    toast.error("Impossible de récupérer les identifiants des bases de données Notion");
    return {};
  }
  
  // Valider chaque base de données configurée
  for (const [dbKey, expectedDb] of Object.entries(expectedDatabases)) {
    const databaseId = configDatabaseIds[dbKey];
    
    if (!databaseId) {
      results[dbKey] = {
        databaseId: dbKey,
        databaseName: expectedDb.name,
        isValid: false,
        missingProperties: ["Base de données non configurée"],
        incorrectTypes: [],
        fullStructure: {}
      };
      continue;
    }
    
    // Valider la structure de la base de données
    results[dbKey] = await validateDatabase(databaseId, expectedDb);
  }
  
  return results;
};
