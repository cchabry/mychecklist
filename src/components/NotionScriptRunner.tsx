
import React, { useState } from 'react';
import { Database, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { notionApiRequest } from '@/lib/notionProxy';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotionScriptRunnerProps {
  apiKey?: string;
}

interface ScriptResult {
  success: boolean;
  projectsDbId?: string;
  checklistsDbId?: string;
  projectsCreated?: number;
  checklistsCreated?: number;
  error?: string;
  details?: any;
}

const NotionScriptRunner: React.FC<NotionScriptRunnerProps> = ({ apiKey = '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' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const runSetupScript = async () => {
    setIsRunning(true);
    setResult(null);
    toast.info('Initialisation des bases de données Notion...');
    console.log("🚀 Démarrage du script avec la clé API:", apiKey.substring(0, 8) + '...');

    try {
      // Création de la base de données Projets
      console.log("👷 Création de la base de données Projets...");
      const projectsDb = await createProjectsDatabase();
      console.log("✅ Base de données Projets créée:", projectsDb);
      
      // Création de la base de données Checklists
      console.log("👷 Création de la base de données Checklists...");
      const checklistsDb = await createChecklistsDatabase();
      console.log("✅ Base de données Checklists créée:", checklistsDb);
      
      // Initialiser le résultat
      const scriptResult: ScriptResult = {
        success: !!(projectsDb || checklistsDb),
        projectsDbId: projectsDb,
        checklistsDbId: checklistsDb,
        projectsCreated: 0,
        checklistsCreated: 0
      };
      
      // Ajout d'exemples dans les bases de données
      if (projectsDb) {
        try {
          const projectCount = await addSampleProjects(projectsDb);
          scriptResult.projectsCreated = projectCount;
          console.log(`✅ ${projectCount} projets ajoutés à la base de données`);
        } catch (error) {
          console.error("❌ Erreur lors de l'ajout des projets:", error);
          scriptResult.details = {
            ...scriptResult.details,
            projectsError: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      if (checklistsDb) {
        try {
          const checklistCount = await addSampleChecklists(checklistsDb);
          scriptResult.checklistsCreated = checklistCount;
          console.log(`✅ ${checklistCount} items de checklist ajoutés à la base de données`);
        } catch (error) {
          console.error("❌ Erreur lors de l'ajout des items de checklist:", error);
          scriptResult.details = {
            ...scriptResult.details,
            checklistsError: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      setResult(scriptResult);
      
      if (scriptResult.success) {
        toast.success('Les bases de données Notion ont été créées avec succès!');
        // Stocker les IDs dans localStorage pour une utilisation ultérieure
        if (projectsDb) localStorage.setItem('notion_database_id', projectsDb);
        if (checklistsDb) localStorage.setItem('notion_checklists_database_id', checklistsDb);
      } else {
        toast.error('Création partielle des bases de données. Consultez les détails.');
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'exécution du script:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        details: error
      });
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
    } finally {
      setIsRunning(false);
    }
  };

  async function createProjectsDatabase() {
    try {
      console.log("📊 Définition de la structure de la BDD Projets");
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

      console.log("🔄 Réponse API pour la création de la BDD Projets:", response);
      console.log(`✅ Base de données Projets créée avec ID: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error("❌ Erreur détaillée lors de la création de la base de données Projets:", error);
      if (error.response) {
        console.error("Réponse d'erreur de l'API:", error.response);
      }
      throw error;
    }
  }

  async function createChecklistsDatabase() {
    try {
      console.log("📊 Définition de la structure de la BDD Checklists");
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

      console.log("🔄 Réponse API pour la création de la BDD Checklists:", response);
      console.log(`✅ Base de données Checklists créée avec ID: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error("❌ Erreur détaillée lors de la création de la base de données Checklists:", error);
      if (error.response) {
        console.error("Réponse d'erreur de l'API:", error.response);
      }
      throw error;
    }
  }

  async function addSampleProjects(databaseId: string) {
    try {
      let count = 0;
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
      count++;

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
      count++;

      console.log(`✅ ${count} exemples de projets ajoutés avec succès!`);
      return count;
    } catch (error) {
      console.error("❌ Erreur détaillée lors de l'ajout des exemples de projets:", error);
      if (error.response) {
        console.error("Réponse d'erreur de l'API:", error.response);
      }
      throw error;
    }
  }

  async function addSampleChecklists(databaseId: string) {
    try {
      let count = 0;
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
      count++;

      // Item 2 - Ajoutons un autre exemple
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
                    content: "Contraste des textes",
                  },
                },
              ],
            },
            Description: {
              rich_text: [
                {
                  text: {
                    content: "Le contraste entre le texte et son arrière-plan doit être suffisant (4.5:1 minimum).",
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
                name: "Contenu éditorial",
              },
            },
            Reference: {
              multi_select: [
                { name: "RGAA" },
                { name: "WCAG" },
                { name: "OPQUAST" },
              ],
            },
            Profile: {
              multi_select: [
                { name: "UI Designer" },
                { name: "Développeur" },
              ],
            },
            Phase: {
              multi_select: [
                { name: "Conception" },
                { name: "Développement" },
              ],
            },
            Effort: {
              select: {
                name: "Moyen",
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
      count++;

      console.log(`✅ ${count} exemples d'items de checklist ajoutés avec succès!`);
      return count;
    } catch (error) {
      console.error("❌ Erreur détaillée lors de l'ajout des exemples d'items de checklist:", error);
      if (error.response) {
        console.error("Réponse d'erreur de l'API:", error.response);
      }
      throw error;
    }
  }

  return (
    <div className="space-y-4">
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

      {result && (
        <div className="mt-4 space-y-4">
          <Alert className={result.success ? "border-green-400" : "border-amber-400"}>
            <AlertTitle className="flex items-center gap-2">
              {result.success ? "✅ Bases de données créées" : "⚠️ Création partielle ou échec"}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Base de données Projets:</div>
                  <div>{result.projectsDbId || "Non créée"}</div>
                  
                  <div className="font-medium">Base de données Checklists:</div>
                  <div>{result.checklistsDbId || "Non créée"}</div>
                  
                  <div className="font-medium">Projets ajoutés:</div>
                  <div>{result.projectsCreated || 0}</div>
                  
                  <div className="font-medium">Items de checklist ajoutés:</div>
                  <div>{result.checklistsCreated || 0}</div>
                </div>
                
                {result.error && (
                  <div className="mt-2 text-red-600">
                    <p className="font-medium">Erreur:</p>
                    <p>{result.error}</p>
                  </div>
                )}
                
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2 p-0" 
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Masquer les détails" : "Afficher les détails"}
                </Button>
                
                {showDetails && result.details && (
                  <pre className="mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default NotionScriptRunner;
