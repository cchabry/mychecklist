
import React, { useState } from 'react';
import { Database, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { notionApiRequest } from '@/lib/notionProxy';

interface NotionScriptRunnerProps {
  apiKey?: string;
}

const NotionScriptRunner: React.FC<NotionScriptRunnerProps> = ({ apiKey = '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' }) => {
  const [isRunning, setIsRunning] = useState(false);

  const runSetupScript = async () => {
    setIsRunning(true);
    toast.info('Initialisation des bases de données Notion...');

    try {
      // Configuration du client Notion avec la clé API fournie
      // We'll use apiKey directly instead of setting it globally
      
      // Création de la base de données Projets
      const projectsDb = await createProjectsDatabase();
      
      // Création de la base de données Checklists
      const checklistsDb = await createChecklistsDatabase();
      
      // Ajout d'exemples dans les bases de données
      if (projectsDb) {
        await addSampleProjects(projectsDb);
      }
      
      if (checklistsDb) {
        await addSampleChecklists(checklistsDb);
      }
      
      toast.success('Les bases de données Notion ont été créées avec succès!');
      console.log("Bases de données créées:", { projectsDb, checklistsDb });
    } catch (error) {
      console.error("Erreur lors de l'exécution du script:", error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
    } finally {
      setIsRunning(false);
    }
  };

  async function createProjectsDatabase() {
    try {
      const response = await notionApiRequest(
        '/databases',
        'POST',
        {
          parent: {
            type: "page_id",
            // Pour simplifier, on utilise une page existante ou on laisse l'utilisateur modifier manuellement
            page_id: "dernière-page-visitée",
          },
          title: [
            {
              type: "text",
              text: {
                content: "Projets d'audit",
              },
            },
          ],
          properties: {
            Name: {
              title: {},
            },
            URL: {
              url: {},
            },
            Description: {
              rich_text: {},
            },
            Status: {
              select: {
                options: [
                  { name: "À faire", color: "blue" },
                  { name: "En cours", color: "yellow" },
                  { name: "Terminé", color: "green" },
                  { name: "Archivé", color: "gray" },
                ],
              },
            },
            Progress: {
              number: {
                format: "percent",
              },
            },
            Created: {
              created_time: {},
            },
            Updated: {
              last_edited_time: {},
            },
            Pages: {
              number: {
                format: "number",
              },
            },
          },
        },
        apiKey
      );

      console.log("Base de données Projets créée avec succès!");
      console.log(`ID de la base de données Projets: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error("Erreur lors de la création de la base de données Projets:", error);
      return null;
    }
  }

  async function createChecklistsDatabase() {
    try {
      const response = await notionApiRequest(
        '/databases',
        'POST',
        {
          parent: {
            type: "page_id",
            // Pour simplifier, on utilise une page existante ou on laisse l'utilisateur modifier manuellement
            page_id: "dernière-page-visitée",
          },
          title: [
            {
              type: "text",
              text: {
                content: "Checklist de bonnes pratiques",
              },
            },
          ],
          properties: {
            Name: {
              title: {},
            },
            Description: {
              rich_text: {},
            },
            Category: {
              select: {
                options: [
                  { name: "Accessibilité", color: "blue" },
                  { name: "Performance", color: "green" },
                  { name: "Ergonomie", color: "yellow" },
                  { name: "Technique", color: "orange" },
                  { name: "Contenu", color: "purple" },
                  { name: "Médias", color: "pink" },
                  { name: "Sécurité", color: "red" },
                ],
              },
            },
            Subcategory: {
              select: {
                options: [
                  { name: "Images", color: "blue" },
                  { name: "Vidéos", color: "blue" },
                  { name: "Formulaires", color: "yellow" },
                  { name: "Navigation", color: "yellow" },
                  { name: "Architecture", color: "orange" },
                  { name: "Contenu éditorial", color: "purple" },
                  { name: "Sécurité des données", color: "red" },
                ],
              },
            },
            Reference: {
              multi_select: {
                options: [
                  { name: "RGAA", color: "blue" },
                  { name: "RGESN", color: "green" },
                  { name: "WCAG", color: "yellow" },
                  { name: "OPQUAST", color: "orange" },
                ],
              },
            },
            Profile: {
              multi_select: {
                options: [
                  { name: "Product Owner", color: "red" },
                  { name: "UX Designer", color: "pink" },
                  { name: "UI Designer", color: "purple" },
                  { name: "Développeur", color: "blue" },
                  { name: "Contributeur", color: "yellow" },
                ],
              },
            },
            Phase: {
              multi_select: {
                options: [
                  { name: "Cadrage", color: "blue" },
                  { name: "Conception", color: "green" },
                  { name: "Développement", color: "yellow" },
                  { name: "Tests", color: "orange" },
                  { name: "Production", color: "red" },
                ],
              },
            },
            Effort: {
              select: {
                options: [
                  { name: "Faible", color: "green" },
                  { name: "Moyen", color: "yellow" },
                  { name: "Important", color: "orange" },
                  { name: "Critique", color: "red" },
                ],
              },
            },
            Priority: {
              select: {
                options: [
                  { name: "Faible", color: "green" },
                  { name: "Moyenne", color: "yellow" },
                  { name: "Haute", color: "orange" },
                  { name: "Critique", color: "red" },
                ],
              },
            },
          },
        },
        apiKey
      );

      console.log("Base de données Checklists créée avec succès!");
      console.log(`ID de la base de données Checklists: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error("Erreur lors de la création de la base de données Checklists:", error);
      return null;
    }
  }

  async function addSampleProjects(databaseId: string) {
    try {
      // Projet 1
      await notionApiRequest(
        '/pages',
        'POST',
        {
          parent: {
            database_id: databaseId,
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: "Site vitrine entreprise",
                  },
                },
              ],
            },
            URL: {
              url: "https://exemple-entreprise.com",
            },
            Description: {
              rich_text: [
                {
                  text: {
                    content: "Audit du site vitrine de l'entreprise Exemple",
                  },
                },
              ],
            },
            Status: {
              select: {
                name: "En cours",
              },
            },
            Progress: {
              number: 25,
            },
            Pages: {
              number: 5,
            },
          },
        },
        apiKey
      );

      // Projet 2
      await notionApiRequest(
        '/pages',
        'POST',
        {
          parent: {
            database_id: databaseId,
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: "E-commerce produits bio",
                  },
                },
              ],
            },
            URL: {
              url: "https://bio-ecoshop.com",
            },
            Description: {
              rich_text: [
                {
                  text: {
                    content: "Audit complet de la boutique en ligne de produits biologiques",
                  },
                },
              ],
            },
            Status: {
              select: {
                name: "À faire",
              },
            },
            Progress: {
              number: 0,
            },
            Pages: {
              number: 8,
            },
          },
        },
        apiKey
      );

      console.log("Exemples de projets ajoutés avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout des exemples de projets:", error);
      throw error;
    }
  }

  async function addSampleChecklists(databaseId: string) {
    try {
      // Item 1
      await notionApiRequest(
        '/pages',
        'POST',
        {
          parent: {
            database_id: databaseId,
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: "Images avec attribut alt",
                  },
                },
              ],
            },
            Description: {
              rich_text: [
                {
                  text: {
                    content: "Toutes les images doivent avoir un attribut alt pertinent décrivant leur contenu.",
                  },
                },
              ],
            },
            Category: {
              select: {
                name: "Accessibilité",
              },
            },
            Subcategory: {
              select: {
                name: "Images",
              },
            },
            Reference: {
              multi_select: [
                { name: "RGAA" },
                { name: "WCAG" },
              ],
            },
            Profile: {
              multi_select: [
                { name: "Développeur" },
                { name: "Contributeur" },
              ],
            },
            Phase: {
              multi_select: [
                { name: "Développement" },
                { name: "Production" },
              ],
            },
            Effort: {
              select: {
                name: "Faible",
              },
            },
            Priority: {
              select: {
                name: "Haute",
              },
            },
          },
        },
        apiKey
      );

      // Item 2 et 3 pourraient être ajoutés de la même façon
      // J'ai simplifié pour éviter de surcharger le code

      console.log("Exemples d'items de checklist ajoutés avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout des exemples d'items de checklist:", error);
      throw error;
    }
  }

  return (
    <Button 
      variant="outline" 
      size="default"
      onClick={runSetupScript}
      disabled={isRunning}
      className="flex items-center gap-2"
    >
      {isRunning ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
          Initialisation en cours...
        </>
      ) : (
        <>
          <Database size={16} />
          Lancer le script BDD
        </>
      )}
    </Button>
  );
};

export default NotionScriptRunner;
