
import { useState } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { useNotion } from '@/contexts/NotionContext';

/**
 * Structure des propriétés pour les bases de données Notion
 */
const DATABASE_STRUCTURES = {
  // Base de données des projets
  projects: {
    "Nom": {
      "title": {}
    },
    "URL": {
      "url": {}
    },
    "Date de création": {
      "date": {}
    },
    "Statut": {
      "select": {
        "options": [
          { "name": "En cours", "color": "yellow" },
          { "name": "Terminé", "color": "green" },
          { "name": "Archivé", "color": "gray" }
        ]
      }
    },
    "Score global": {
      "number": {}
    }
  },
  
  // Base de données des exigences
  requirements: {
    "ID": {
      "rich_text": {}
    },
    "Titre": {
      "title": {}
    },
    "Description": {
      "rich_text": {}
    },
    "Catégorie": {
      "select": {
        "options": [
          { "name": "Performance", "color": "green" },
          { "name": "Accessibilité", "color": "blue" },
          { "name": "SEO", "color": "orange" },
          { "name": "UX", "color": "purple" },
          { "name": "Sécurité", "color": "red" },
          { "name": "Technique", "color": "gray" }
        ]
      }
    },
    "Sous-catégorie": {
      "select": {
        "options": [
          { "name": "Navigation", "color": "blue" },
          { "name": "Formulaires", "color": "purple" },
          { "name": "Images", "color": "orange" },
          { "name": "Contenu", "color": "green" },
          { "name": "Structure", "color": "yellow" }
        ]
      }
    },
    "Niveau d'importance": {
      "select": {
        "options": [
          { "name": "Majeur", "color": "red" },
          { "name": "Important", "color": "orange" },
          { "name": "Moyen", "color": "yellow" },
          { "name": "Mineur", "color": "green" },
          { "name": "N/A", "color": "gray" }
        ]
      }
    },
    "Référence": {
      "rich_text": {}
    }
  },
  
  // Base de données des audits
  audits: {
    "Projet": {
      "relation": {
        "database_id": "", // À remplir dynamiquement
        "single_property": {}
      }
    },
    "Nom": {
      "title": {}
    },
    "Date": {
      "date": {}
    },
    "Statut": {
      "select": {
        "options": [
          { "name": "En cours", "color": "yellow" },
          { "name": "Terminé", "color": "green" },
          { "name": "Archivé", "color": "gray" }
        ]
      }
    },
    "Score": {
      "number": {}
    }
  },
  
  // Base de données des résultats d'audit (items évalués)
  auditResults: {
    "Audit": {
      "relation": {
        "database_id": "", // À remplir dynamiquement avec l'ID de la BDD audits
        "single_property": {}
      }
    },
    "Exigence": {
      "relation": {
        "database_id": "", // À remplir dynamiquement avec l'ID de la BDD requirements
        "single_property": {}
      }
    },
    "Statut": {
      "select": {
        "options": [
          { "name": "Conforme", "color": "green" },
          { "name": "Partiellement conforme", "color": "yellow" },
          { "name": "Non conforme", "color": "red" },
          { "name": "Non applicable", "color": "gray" },
          { "name": "Non évalué", "color": "blue" }
        ]
      }
    },
    "Commentaire": {
      "rich_text": {}
    },
    "URL vérifiées": {
      "rich_text": {}
    },
    "Score": {
      "number": {}
    },
    "Priorité": {
      "select": {
        "options": [
          { "name": "Critique", "color": "red" },
          { "name": "Haute", "color": "orange" },
          { "name": "Moyenne", "color": "yellow" },
          { "name": "Basse", "color": "green" }
        ]
      }
    }
  }
};

/**
 * Hook pour gérer la création des bases de données Notion
 */
export const useNotionDatabaseCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState("");
  const { config } = useNotion();
  
  /**
   * Crée une base de données dans Notion
   */
  const createDatabase = async (pageId: string, title: string, properties: any) => {
    if (!config.apiKey) {
      throw new Error("Clé API Notion non configurée");
    }
    
    try {
      setCreationStep(`Création de la base de données "${title}"...`);
      const result = await notionApi.databases.create(pageId, title, properties, config.apiKey);
      toast.success(`Base de données "${title}" créée`, {
        description: "ID: " + result.id
      });
      return result.id;
    } catch (error) {
      console.error(`Erreur lors de la création de la base de données "${title}":`, error);
      toast.error(`Échec de création de "${title}"`, {
        description: error.message
      });
      throw error;
    }
  };
  
  /**
   * Obtient une page Notion (ou en crée une nouvelle) pour y créer nos bases de données
   */
  const getOrCreateWorkspacePage = async (
    title: string = "myChecklist Workspace"
  ) => {
    setCreationStep("Recherche d'un espace de travail existant...");

    try {
      // Rechercher une page avec ce titre
      const searchResult = await notionApi.request('/search', 'POST', {
        query: title,
        filter: { property: "object", value: "page" }
      }, config.apiKey);
      
      if (searchResult.results && searchResult.results.length > 0) {
        setCreationStep("Espace de travail existant trouvé !");
        return searchResult.results[0].id;
      }
      
      // Si aucune page n'est trouvée, en créer une nouvelle
      setCreationStep("Création d'un nouvel espace de travail...");
      const newPage = await notionApi.pages.create({
        parent: { type: "workspace", workspace: true },
        properties: {
          title: [{ type: "text", text: { content: title } }]
        },
        children: [
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [{ type: "text", text: { content: "myChecklist Workspace" } }]
            }
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: "Espace de travail pour l'application myChecklist" } }]
            }
          }
        ]
      }, config.apiKey);
      
      setCreationStep("Nouvel espace de travail créé !");
      return newPage.id;
    } catch (error) {
      console.error("Erreur lors de la création de l'espace de travail:", error);
      throw new Error("Impossible de créer l'espace de travail Notion: " + error.message);
    }
  };
  
  /**
   * Crée les bases de données nécessaires pour l'application
   */
  const createDatabases = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    setCreationStep("Initialisation...");
    
    try {
      // 1. Obtenir ou créer une page de travail
      const workspacePageId = await getOrCreateWorkspacePage();
      
      // 2. Créer la base de données des projets
      const projectsDbId = await createDatabase(
        workspacePageId,
        "Projets myChecklist",
        DATABASE_STRUCTURES.projects
      );
      
      // Sauvegarder l'ID de la base de données des projets
      localStorage.setItem("notion_database_id", projectsDbId);
      
      // 3. Créer la base de données des exigences
      const requirementsDbId = await createDatabase(
        workspacePageId,
        "Exigences myChecklist",
        DATABASE_STRUCTURES.requirements
      );
      
      // Sauvegarder l'ID de la base de données des exigences
      localStorage.setItem("notion_requirements_database_id", requirementsDbId);
      
      // 4. Créer la base de données des audits
      const auditProperties = { ...DATABASE_STRUCTURES.audits };
      auditProperties.Projet.relation.database_id = projectsDbId;
      
      const auditsDbId = await createDatabase(
        workspacePageId,
        "Audits myChecklist",
        auditProperties
      );
      
      // Sauvegarder l'ID de la base de données des audits
      localStorage.setItem("notion_audits_database_id", auditsDbId);
      
      // 5. Créer la base de données des résultats d'audit
      const auditResultsProperties = { ...DATABASE_STRUCTURES.auditResults };
      auditResultsProperties.Audit.relation.database_id = auditsDbId;
      auditResultsProperties.Exigence.relation.database_id = requirementsDbId;
      
      const auditResultsDbId = await createDatabase(
        workspacePageId,
        "Résultats d'audit myChecklist",
        auditResultsProperties
      );
      
      // Sauvegarder l'ID de la base de données des résultats d'audit
      localStorage.setItem("notion_audit_results_database_id", auditResultsDbId);
      
      setCreationStep("Configuration terminée !");
      toast.success("Bases de données Notion créées avec succès", {
        description: "Les IDs ont été sauvegardés dans la configuration"
      });
      
      return {
        projectsDbId,
        requirementsDbId,
        auditsDbId,
        auditResultsDbId,
        workspacePageId
      };
    } catch (error) {
      console.error("Erreur lors de la création des bases de données:", error);
      toast.error("Erreur de création des bases de données", {
        description: error.message
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    isCreating,
    creationStep,
    createDatabases
  };
};
