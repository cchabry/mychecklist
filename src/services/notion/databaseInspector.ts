
import { notionClient } from './client';
import { operationMode } from '@/services/operationMode';

// Interface pour décrire les propriétés requises d'une base de données
interface RequiredProperty {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

// Structure d'une base de données à valider
interface DatabaseRequirement {
  name: string;
  description: string;
  configKey: string; // Clé de configuration dans localStorage
  requiredProperties: RequiredProperty[];
}

// Résultat de validation d'une base de données
export interface DatabaseValidationResult {
  databaseId: string;
  databaseName: string;
  isValid: boolean;
  missingProperties: string[];
  incorrectTypes: Array<{ property: string, expected: string, actual: string }>;
  fullStructure: Record<string, any>;
}

// Définition des bases de données requises par l'application
const requiredDatabases: DatabaseRequirement[] = [
  {
    name: "Projets",
    description: "Base de données principale des projets",
    configKey: "notion_database_id",
    requiredProperties: [
      { name: "Name", type: "title", required: true, description: "Nom du projet" },
      { name: "URL", type: "url", required: true, description: "URL principale du site" },
      { name: "Status", type: "select", required: false, description: "Statut du projet" },
      { name: "Description", type: "rich_text", required: false, description: "Description du projet" }
    ]
  },
  {
    name: "Audits",
    description: "Base de données des audits",
    configKey: "notion_audit_database_id",
    requiredProperties: [
      { name: "Name", type: "title", required: true, description: "Nom de l'audit" },
      { name: "Project", type: "relation", required: true, description: "Relation vers le projet" },
      { name: "Score", type: "number", required: false, description: "Score global de l'audit" },
      { name: "Version", type: "rich_text", required: false, description: "Version de l'audit" }
    ]
  },
  {
    name: "Checklists",
    description: "Référentiel de bonnes pratiques",
    configKey: "notion_checklists_database_id",
    requiredProperties: [
      { name: "Name", type: "title", required: true, description: "Titre de l'item" },
      { name: "Description", type: "rich_text", required: false, description: "Description détaillée" },
      { name: "Category", type: "select", required: true, description: "Catégorie de l'item" },
      { name: "Subcategory", type: "select", required: false, description: "Sous-catégorie" },
      { name: "Effort", type: "select", required: false, description: "Complexité de mise en œuvre" },
      { name: "Priority", type: "select", required: false, description: "Priorité de l'item" }
    ]
  },
  {
    name: "Pages",
    description: "Échantillon de pages pour les audits",
    configKey: "notion_pages_database_id",
    requiredProperties: [
      { name: "Name", type: "title", required: true, description: "Titre de la page" },
      { name: "URL", type: "url", required: true, description: "URL de la page" },
      { name: "Project", type: "relation", required: true, description: "Relation vers le projet" },
      { name: "Description", type: "rich_text", required: false, description: "Description ou contexte" }
    ]
  },
  {
    name: "Exigences",
    description: "Exigences spécifiques à un projet",
    configKey: "notion_exigences_database_id",
    requiredProperties: [
      { name: "Name", type: "title", required: true, description: "Titre de l'exigence" },
      { name: "Project", type: "relation", required: true, description: "Relation vers le projet" },
      { name: "Checklist", type: "relation", required: true, description: "Relation vers l'item de la checklist" },
      { name: "Importance", type: "select", required: true, description: "Niveau d'importance" },
      { name: "Comment", type: "rich_text", required: false, description: "Commentaire explicatif" }
    ]
  }
];

/**
 * Valide une base de données Notion par rapport aux propriétés requises
 */
const validateDatabase = async (
  databaseId: string, 
  requirement: DatabaseRequirement
): Promise<DatabaseValidationResult> => {
  // Désactiver temporairement le mode démo si actif
  const wasDemoMode = operationMode.isDemoMode;
  if (wasDemoMode) {
    operationMode.temporarilyForceReal();
  }
  
  try {
    // Récupérer la structure de la base de données
    const response = await notionClient.get(`/databases/${databaseId}`);
    
    if (!response.success) {
      return {
        databaseId,
        databaseName: requirement.name,
        isValid: false,
        missingProperties: [requirement.name === "Projets" ? "Base de données inaccessible" : "Base de données non configurée"],
        incorrectTypes: [],
        fullStructure: {}
      };
    }
    
    const data = response.data;
    const properties = data.properties || {};
    const databaseName = data.title?.[0]?.plain_text || requirement.name;
    
    // Vérifier les propriétés requises
    const missingProperties: string[] = [];
    const incorrectTypes: Array<{ property: string, expected: string, actual: string }> = [];
    
    for (const reqProp of requirement.requiredProperties) {
      // Chercher la propriété dans la base de données
      const foundProperty = Object.entries(properties).find(([name, _]) => 
        name.toLowerCase() === reqProp.name.toLowerCase()
      );
      
      if (!foundProperty) {
        if (reqProp.required) {
          missingProperties.push(reqProp.name);
        }
      } else {
        const [actualName, propDetails] = foundProperty;
        
        // Utiliser type assertion pour accéder à la propriété type
        const actualType = (propDetails as any).type;
        
        // Vérifier le type
        if (actualType !== reqProp.type) {
          incorrectTypes.push({
            property: actualName,
            expected: reqProp.type,
            actual: actualType
          });
        }
      }
    }
    
    // Restaurer le mode démo si nécessaire
    if (wasDemoMode) {
      operationMode.enableDemoMode("Mode démo réactivé après validation de base de données");
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
    
    // Restaurer le mode démo si nécessaire
    if (wasDemoMode) {
      operationMode.enableDemoMode("Mode démo réactivé après erreur de validation");
    }
    
    return {
      databaseId,
      databaseName: requirement.name,
      isValid: false,
      missingProperties: ["Erreur d'accès à la base de données"],
      incorrectTypes: [],
      fullStructure: { error: error.message || String(error) }
    };
  }
};

/**
 * Valide toutes les bases de données configurées
 */
export const validateAllDatabases = async (): Promise<Record<string, DatabaseValidationResult>> => {
  const results: Record<string, DatabaseValidationResult> = {};
  
  for (const dbRequirement of requiredDatabases) {
    const databaseId = localStorage.getItem(dbRequirement.configKey);
    
    if (databaseId) {
      // Base de données configurée, la valider
      results[dbRequirement.configKey] = await validateDatabase(databaseId, dbRequirement);
    } else {
      // Base de données non configurée
      results[dbRequirement.configKey] = {
        databaseId: "non_configurée",
        databaseName: dbRequirement.name,
        isValid: false,
        missingProperties: ["Base de données non configurée dans les paramètres"],
        incorrectTypes: [],
        fullStructure: {}
      };
    }
  }
  
  return results;
};
