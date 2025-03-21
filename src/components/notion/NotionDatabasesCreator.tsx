
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

// Interface pour une base de données à créer
interface DatabaseSchema {
  name: string;
  description: string;
  properties: Record<string, any>;
  key: string;
  storageKey: string;
}

// Interface pour stocker les résultats des créations
interface DatabaseResult {
  id: string | null;
  name: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  response?: any;
}

// Schémas des bases de données à créer
const DATABASE_SCHEMAS: DatabaseSchema[] = [
  {
    name: "Projets d'audit",
    description: "Stocke les informations sur les sites web à auditer",
    key: "projects",
    storageKey: "notion_database_id",
    properties: {
      Name: {
        title: {}
      },
      URL: {
        url: {}
      },
      Description: {
        rich_text: {}
      },
      Status: {
        select: {
          options: [
            { name: "À faire", color: "gray" },
            { name: "En cours", color: "blue" },
            { name: "Terminé", color: "green" },
            { name: "Archivé", color: "default" }
          ]
        }
      },
      Progress: {
        number: {
          format: "percent"
        }
      },
      Pages: {
        number: {}
      },
      Created: {
        created_time: {}
      },
      Updated: {
        last_edited_time: {}
      }
    }
  },
  {
    name: "Checklist de bonnes pratiques",
    description: "Contient les critères d'évaluation et bonnes pratiques",
    key: "checklists",
    storageKey: "notion_checklists_database_id",
    properties: {
      Name: {
        title: {}
      },
      Description: {
        rich_text: {}
      },
      Category: {
        select: {
          options: [
            { name: "Accessibilité", color: "blue" },
            { name: "Performance", color: "green" },
            { name: "Ergonomie", color: "orange" },
            { name: "Technique", color: "purple" },
            { name: "Contenu", color: "yellow" },
            { name: "Médias", color: "pink" },
            { name: "Sécurité", color: "red" }
          ]
        }
      },
      Subcategory: {
        select: {}
      },
      Reference: {
        multi_select: {}
      },
      Profile: {
        multi_select: {}
      },
      Phase: {
        multi_select: {}
      },
      Effort: {
        select: {
          options: [
            { name: "Faible", color: "green" },
            { name: "Moyen", color: "yellow" },
            { name: "Important", color: "orange" },
            { name: "Critique", color: "red" }
          ]
        }
      },
      Priority: {
        select: {
          options: [
            { name: "Faible", color: "gray" },
            { name: "Moyenne", color: "yellow" },
            { name: "Haute", color: "orange" },
            { name: "Critique", color: "red" }
          ]
        }
      }
    }
  },
  {
    name: "Pages d'échantillon",
    description: "Liste des pages à auditer pour chaque projet",
    key: "pages",
    storageKey: "notion_pages_database_id",
    properties: {
      Name: {
        title: {}
      },
      Project: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      URL: {
        url: {}
      },
      Description: {
        rich_text: {}
      },
      Order: {
        number: {}
      }
    }
  },
  {
    name: "Audits",
    description: "Stocke les informations générales sur les audits",
    key: "audits",
    storageKey: "notion_audits_database_id",
    properties: {
      Name: {
        title: {}
      },
      Project: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Score: {
        number: {
          format: "percent"
        }
      },
      Status: {
        select: {
          options: [
            { name: "En cours", color: "blue" },
            { name: "Terminé", color: "green" },
            { name: "Archivé", color: "gray" }
          ]
        }
      },
      Version: {
        rich_text: {}
      },
      CreatedAt: {
        date: {}
      },
      UpdatedAt: {
        date: {}
      },
      CompletedAt: {
        date: {}
      }
    }
  },
  {
    name: "Exigences",
    description: "Définit les exigences spécifiques pour chaque projet",
    key: "requirements",
    storageKey: "notion_requirements_database_id",
    properties: {
      Name: {
        title: {}
      },
      Project: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Checklist: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Importance: {
        select: {
          options: [
            { name: "N/A", color: "gray" },
            { name: "Mineur", color: "blue" },
            { name: "Moyen", color: "yellow" },
            { name: "Important", color: "orange" },
            { name: "Majeur", color: "red" }
          ]
        }
      },
      Comment: {
        rich_text: {}
      }
    }
  },
  {
    name: "Évaluations",
    description: "Résultats d'évaluation pour chaque page et exigence",
    key: "evaluations",
    storageKey: "notion_evaluations_database_id",
    properties: {
      Name: {
        title: {}
      },
      Audit: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Page: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Requirement: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Score: {
        select: {
          options: [
            { name: "Conforme", color: "green" },
            { name: "Partiellement conforme", color: "yellow" },
            { name: "Non conforme", color: "red" },
            { name: "Non Applicable", color: "gray" }
          ]
        }
      },
      Comment: {
        rich_text: {}
      },
      Attachments: {
        files: {}
      }
    }
  },
  {
    name: "Actions correctives",
    description: "Actions à réaliser pour corriger les non-conformités",
    key: "actions",
    storageKey: "notion_actions_database_id",
    properties: {
      Name: {
        title: {}
      },
      Evaluation: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      TargetScore: {
        select: {
          options: [
            { name: "Conforme", color: "green" },
            { name: "Partiellement conforme", color: "yellow" }
          ]
        }
      },
      Priority: {
        select: {
          options: [
            { name: "Faible", color: "gray" },
            { name: "Moyenne", color: "yellow" },
            { name: "Haute", color: "orange" },
            { name: "Critique", color: "red" }
          ]
        }
      },
      DueDate: {
        date: {}
      },
      Responsible: {
        rich_text: {}
      },
      Comment: {
        rich_text: {}
      },
      Status: {
        select: {
          options: [
            { name: "À faire", color: "gray" },
            { name: "En cours", color: "blue" },
            { name: "Terminé", color: "green" }
          ]
        }
      }
    }
  },
  {
    name: "Suivi des progrès",
    description: "Historique des interventions sur les actions correctives",
    key: "progress",
    storageKey: "notion_progress_database_id",
    properties: {
      Name: {
        title: {}
      },
      Action: {
        relation: {
          database_id: "" // Sera rempli dynamiquement
        }
      },
      Date: {
        date: {}
      },
      Responsible: {
        rich_text: {}
      },
      Comment: {
        rich_text: {}
      },
      Score: {
        select: {
          options: [
            { name: "Conforme", color: "green" },
            { name: "Partiellement conforme", color: "yellow" },
            { name: "Non conforme", color: "red" }
          ]
        }
      },
      Status: {
        select: {
          options: [
            { name: "À faire", color: "gray" },
            { name: "En cours", color: "blue" },
            { name: "Terminé", color: "green" }
          ]
        }
      }
    }
  }
];

const NotionDatabasesCreator: React.FC = () => {
  const [pageId, setPageId] = useState<string>(localStorage.getItem('notion_parent_page_id') || '');
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('notion_api_key') || '');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, DatabaseResult>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("settings");

  // Initialiser les résultats
  useEffect(() => {
    const initialResults: Record<string, DatabaseResult> = {};
    DATABASE_SCHEMAS.forEach(schema => {
      // Vérifier si l'ID est déjà stocké
      const savedId = localStorage.getItem(schema.storageKey);
      initialResults[schema.key] = {
        id: savedId,
        name: schema.name,
        status: savedId ? 'success' : 'pending'
      };
    });
    setResults(initialResults);
  }, []);

  // Fonction pour ajouter un log
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Fonction pour mettre à jour le statut d'une base de données
  const updateDatabaseStatus = (key: string, status: 'pending' | 'success' | 'error', data?: { id?: string; error?: string; response?: any }) => {
    setResults(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status,
        id: data?.id || prev[key].id,
        error: data?.error,
        response: data?.response
      }
    }));
  };

  // Création des bases de données
  const createDatabases = async () => {
    if (!pageId.trim()) {
      toast.error("Veuillez spécifier l'ID de la page parent");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.error("Veuillez spécifier la clé API Notion");
      return;
    }
    
    // Sauvegarder les valeurs dans localStorage
    localStorage.setItem('notion_parent_page_id', pageId);
    localStorage.setItem('notion_api_key', apiKey);
    
    setIsCreating(true);
    setLogs([]);
    addLog("Début de la création des bases de données...");
    
    try {
      // Créer chaque base de données dans l'ordre
      for (const schema of DATABASE_SCHEMAS) {
        updateDatabaseStatus(schema.key, 'pending');
        addLog(`Création de la base de données "${schema.name}"...`);
        
        try {
          // Vérifier si un ID est déjà enregistré
          const existingId = localStorage.getItem(schema.storageKey);
          if (existingId) {
            addLog(`La base "${schema.name}" existe déjà avec l'ID: ${existingId}`);
            updateDatabaseStatus(schema.key, 'success', { id: existingId });
            continue;
          }
          
          // Pour les bases avec relations, mettre à jour les ID de référence
          if (schema.properties) {
            for (const propKey in schema.properties) {
              const prop = schema.properties[propKey];
              if (prop.relation && prop.relation.database_id === "") {
                // Projets
                if (propKey === "Project") {
                  const projectsDbId = localStorage.getItem("notion_database_id");
                  if (projectsDbId) {
                    prop.relation.database_id = projectsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID de Projets: ${projectsDbId}`);
                  }
                }
                // Checklist
                if (propKey === "Checklist") {
                  const checklistsDbId = localStorage.getItem("notion_checklists_database_id");
                  if (checklistsDbId) {
                    prop.relation.database_id = checklistsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID de Checklists: ${checklistsDbId}`);
                  }
                }
                // Pages
                if (propKey === "Page") {
                  const pagesDbId = localStorage.getItem("notion_pages_database_id");
                  if (pagesDbId) {
                    prop.relation.database_id = pagesDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID de Pages: ${pagesDbId}`);
                  }
                }
                // Audit
                if (propKey === "Audit") {
                  const auditsDbId = localStorage.getItem("notion_audits_database_id");
                  if (auditsDbId) {
                    prop.relation.database_id = auditsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID d'Audits: ${auditsDbId}`);
                  }
                }
                // Requirement/Exigence
                if (propKey === "Requirement") {
                  const requirementsDbId = localStorage.getItem("notion_requirements_database_id");
                  if (requirementsDbId) {
                    prop.relation.database_id = requirementsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID d'Exigences: ${requirementsDbId}`);
                  }
                }
                // Evaluation
                if (propKey === "Evaluation") {
                  const evaluationsDbId = localStorage.getItem("notion_evaluations_database_id");
                  if (evaluationsDbId) {
                    prop.relation.database_id = evaluationsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID d'Évaluations: ${evaluationsDbId}`);
                  }
                }
                // Action
                if (propKey === "Action") {
                  const actionsDbId = localStorage.getItem("notion_actions_database_id");
                  if (actionsDbId) {
                    prop.relation.database_id = actionsDbId;
                    addLog(`Relation mise à jour pour "${propKey}" avec l'ID d'Actions: ${actionsDbId}`);
                  }
                }
              }
            }
          }
          
          // Préparer les données pour la création
          const dbData = {
            title: [
              {
                type: "text",
                text: {
                  content: schema.name
                }
              }
            ],
            properties: schema.properties
          };
          
          console.log(`Création de la BDD ${schema.name}:`, {
            parent: { page_id: pageId },
            ...dbData
          });
          
          // Créer la base de données
          const response = await notionApi.databases.create(pageId, dbData, apiKey);
          console.log(`Réponse de l'API pour ${schema.name}:`, response);
          
          if (response && response.id) {
            addLog(`✅ Base de données "${schema.name}" créée avec succès. ID: ${response.id}`);
            localStorage.setItem(schema.storageKey, response.id);
            updateDatabaseStatus(schema.key, 'success', { id: response.id, response });
            
            // Afficher un toast de succès
            toast.success(`Base "${schema.name}" créée`, {
              description: `ID: ${response.id}`
            });
          } else {
            throw new Error("Réponse invalide de l'API");
          }
        } catch (error) {
          console.error(`Erreur lors de la création de la base "${schema.name}":`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          addLog(`❌ Erreur lors de la création de "${schema.name}": ${errorMessage}`);
          updateDatabaseStatus(schema.key, 'error', { error: errorMessage });
          
          // Afficher un toast d'erreur
          toast.error(`Erreur: ${schema.name}`, {
            description: errorMessage
          });
        }
        
        // Attendre un peu entre chaque création pour éviter les limites de rate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog("Processus de création terminé.");
      
      // Vérifier si tout s'est bien passé
      const allSuccess = Object.values(results).every(r => r.status === 'success');
      if (allSuccess) {
        toast.success("Toutes les bases de données ont été créées avec succès", {
          description: "Votre application est prête à utiliser Notion"
        });
      } else {
        toast.warning("Certaines bases de données n'ont pas été créées", {
          description: "Vérifiez les détails dans l'onglet Résultats"
        });
      }
    } catch (error) {
      console.error("Erreur globale:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Erreur globale: ${errorMessage}`);
      toast.error("Erreur lors de la création des bases de données", {
        description: errorMessage
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Vérification de la configuration Notion
  const notionConfigured = Boolean(apiKey && pageId);
  
  // Vérification du nombre de BDD déjà créées
  const createdCount = Object.values(results).filter(r => r.status === 'success').length;
  const totalCount = DATABASE_SCHEMAS.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="h-5 w-5" />
          Création des bases de données Notion
        </CardTitle>
        <CardDescription>
          Cet outil va créer toutes les bases de données nécessaires au fonctionnement de l'application dans votre espace Notion.
        </CardDescription>
      </CardHeader>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3 mx-6">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="results">Résultats {createdCount > 0 && `(${createdCount}/${totalCount})`}</TabsTrigger>
          <TabsTrigger value="logs">Logs {logs.length > 0 && `(${logs.length})`}</TabsTrigger>
        </TabsList>
        
        <CardContent>
          <TabsContent value="settings" className="mt-4">
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Prérequis</AlertTitle>
                <AlertDescription>
                  Vous devez d'abord créer une page Notion et la partager avec votre intégration.
                  Assurez-vous que votre intégration a les permissions d'écriture.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <label htmlFor="pageId" className="text-sm font-medium">
                  ID de la page parent Notion
                </label>
                <Input
                  id="pageId"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="ID de la page Notion (ex: 83d9d3a270ff4b0a95856a96db5a7e35)"
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  L'ID se trouve dans l'URL de votre page Notion après le dernier "/" et avant le "?".
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Clé API Notion
                </label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Clé API Notion (ex: secret_...)"
                  type="password"
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Bases de données à créer</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DATABASE_SCHEMAS.map((schema) => (
                    <div key={schema.key} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{schema.name}</p>
                        <p className="text-xs text-muted-foreground">{schema.description}</p>
                      </div>
                      {results[schema.key]?.status === 'success' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Créée
                        </Badge>
                      )}
                      {results[schema.key]?.status === 'error' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erreur
                        </Badge>
                      )}
                      {results[schema.key]?.status === 'pending' && !results[schema.key]?.id && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            {Object.values(results).length > 0 ? (
              Object.values(results).map((result) => (
                <div key={result.name} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{result.name}</h3>
                    {result.status === 'success' && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Créée</Badge>
                    )}
                    {result.status === 'error' && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Erreur</Badge>
                    )}
                    {result.status === 'pending' && (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">En attente</Badge>
                    )}
                  </div>
                  
                  {result.id && (
                    <div className="text-sm">
                      <span className="font-medium">ID:</span> {result.id}
                    </div>
                  )}
                  
                  {result.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun résultat disponible
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="text-sm py-1">
                    {log.includes("✅") ? (
                      <span className="text-green-600">{log}</span>
                    ) : log.includes("❌") ? (
                      <span className="text-red-600">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Les logs apparaîtront ici pendant la création
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-6">
        <div className="text-sm text-muted-foreground">
          {createdCount}/{totalCount} bases de données créées
        </div>
        <Button 
          onClick={createDatabases} 
          disabled={isCreating || !notionConfigured}
        >
          {isCreating ? "Création en cours..." : "Créer les bases de données"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionDatabasesCreator;
