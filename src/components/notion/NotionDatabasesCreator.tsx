
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, Clock, Database, RefreshCcw } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useNotionAPI } from '@/hooks/notion/useNotionAPI';

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
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const { isLoading, executeRequest } = useNotionAPI();

  // Initialiser les résultats
  useEffect(() => {
    // Vérifier si on est en mode mock
    const checkMockMode = async () => {
      const mockActive = notionApi.mockMode.isActive();
      setIsMockMode(mockActive);
      if (mockActive) {
        addLog("⚠️ Mode mock activé - Désactivation pour les créations de BDD");
        notionApi.mockMode.forceReset();
      }
    };
    
    checkMockMode();
    
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
    console.log(`[DB Creator] ${message}`);
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

  // Test de connexion Notion avant création
  const testNotionConnection = async (): Promise<boolean> => {
    addLog("🔍 Test de connexion à l'API Notion...");
    
    try {
      // Désactiver le mode mock pour le test
      notionApi.mockMode.forceReset();
      
      // Tester la connexion à l'API
      const response = await notionApi.users.me(apiKey);
      
      if (response && response.id) {
        addLog(`✅ Connexion réussie en tant que: ${response.name || response.id}`);
        return true;
      } else {
        throw new Error("Réponse invalide de l'API Notion");
      }
    } catch (error) {
      addLog(`❌ Échec de la connexion: ${error.message}`);
      return false;
    }
  };

  // Fonction pour récupérer une base de données existante
  const retrieveDatabase = async (dbId: string): Promise<any> => {
    if (!dbId) return null;
    
    try {
      addLog(`🔍 Vérification de la base de données ${dbId}...`);
      const response = await notionApi.databases.retrieve(dbId, apiKey);
      
      if (response && response.id) {
        const dbName = response.title?.[0]?.plain_text || dbId;
        addLog(`✅ Base de données "${dbName}" (${dbId}) accessible`);
        return response;
      }
    } catch (error) {
      addLog(`⚠️ Base de données ${dbId} non accessible: ${error.message}`);
      return null;
    }
  };

  // Création d'une seule base de données
  const createSingleDatabase = async (schema: DatabaseSchema): Promise<string | null> => {
    addLog(`🏗️ Création de la base de données "${schema.name}"...`);
    updateDatabaseStatus(schema.key, 'pending');
    
    try {
      // Vérifier si un ID est déjà enregistré
      const existingId = localStorage.getItem(schema.storageKey);
      if (existingId) {
        const existingDb = await retrieveDatabase(existingId);
        if (existingDb) {
          addLog(`✅ La base "${schema.name}" existe déjà avec l'ID: ${existingId}`);
          updateDatabaseStatus(schema.key, 'success', { id: existingId });
          return existingId;
        } else {
          addLog(`⚠️ Base de données ${existingId} introuvable - Recréation nécessaire`);
          localStorage.removeItem(schema.storageKey);
        }
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
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Projets (${projectsDbId})`);
              }
            }
            // Checklist
            if (propKey === "Checklist") {
              const checklistsDbId = localStorage.getItem("notion_checklists_database_id");
              if (checklistsDbId) {
                prop.relation.database_id = checklistsDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Checklists (${checklistsDbId})`);
              }
            }
            // Pages
            if (propKey === "Page") {
              const pagesDbId = localStorage.getItem("notion_pages_database_id");
              if (pagesDbId) {
                prop.relation.database_id = pagesDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Pages (${pagesDbId})`);
              }
            }
            // Audit
            if (propKey === "Audit") {
              const auditsDbId = localStorage.getItem("notion_audits_database_id");
              if (auditsDbId) {
                prop.relation.database_id = auditsDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Audits (${auditsDbId})`);
              }
            }
            // Requirement/Exigence
            if (propKey === "Requirement") {
              const requirementsDbId = localStorage.getItem("notion_requirements_database_id");
              if (requirementsDbId) {
                prop.relation.database_id = requirementsDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Exigences (${requirementsDbId})`);
              }
            }
            // Evaluation
            if (propKey === "Evaluation") {
              const evaluationsDbId = localStorage.getItem("notion_evaluations_database_id");
              if (evaluationsDbId) {
                prop.relation.database_id = evaluationsDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Évaluations (${evaluationsDbId})`);
              }
            }
            // Action
            if (propKey === "Action") {
              const actionsDbId = localStorage.getItem("notion_actions_database_id");
              if (actionsDbId) {
                prop.relation.database_id = actionsDbId;
                addLog(`ℹ️ Relation mise à jour: "${propKey}" → Actions (${actionsDbId})`);
              }
            }
          }
        }
      }
      
      // Préparer les données pour la création (méthode éprouvée)
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

      // Créer la base de données de manière directe (méthode éprouvée)
      addLog(`📝 Envoi de la requête de création pour "${schema.name}"...`);
      
      // Utiliser la méthode qui a fonctionné précédemment
      const response = await executeRequest(
        async () => {
          return notionApi.databases.create(pageId, dbData, apiKey);
        },
        {
          mockResponse: {
            id: `mock-${schema.key}-${Date.now()}`,
            created_time: new Date().toISOString(),
            last_edited_time: new Date().toISOString(),
            title: [{ type: "text", text: { content: schema.name } }],
            properties: schema.properties
          },
          errorContext: `Création de la base de données "${schema.name}"`
        }
      );
      
      if (response && response.id) {
        addLog(`✅ Base de données "${schema.name}" créée avec succès. ID: ${response.id}`);
        localStorage.setItem(schema.storageKey, response.id);
        updateDatabaseStatus(schema.key, 'success', { id: response.id, response });
        
        // Afficher un toast de succès
        toast.success(`Base "${schema.name}" créée`, {
          description: `ID: ${response.id}`
        });
        
        return response.id;
      } else {
        throw new Error("Réponse invalide de l'API");
      }
    } catch (error) {
      console.error(`Erreur lors de la création de la base "${schema.name}":`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`❌ Erreur: "${schema.name}": ${errorMessage}`);
      updateDatabaseStatus(schema.key, 'error', { error: errorMessage });
      
      // Afficher un toast d'erreur
      toast.error(`Erreur: ${schema.name}`, {
        description: errorMessage
      });
      
      return null;
    }
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
    
    // Désactiver le mode mock pour les opérations réelles
    if (notionApi.mockMode.isActive()) {
      addLog("⚠️ Mode mock désactivé pour les opérations de création");
      notionApi.mockMode.forceReset();
    }
    
    // Tester la connexion avant de poursuivre
    const connectionOk = await testNotionConnection();
    if (!connectionOk) {
      toast.error("Impossible de se connecter à l'API Notion", {
        description: "Vérifiez votre clé API et réessayez"
      });
      setIsCreating(false);
      return;
    }
    
    addLog("🚀 Début de la création des bases de données...");
    
    try {
      // Créer d'abord les bases principales (projets et checklists)
      const mainSchemas = DATABASE_SCHEMAS.filter(s => s.key === 'projects' || s.key === 'checklists');
      const restSchemas = DATABASE_SCHEMAS.filter(s => s.key !== 'projects' && s.key !== 'checklists');
      
      addLog("1️⃣ Création des bases de données principales...");
      for (const schema of mainSchemas) {
        await createSingleDatabase(schema);
        // Court délai entre chaque création
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog("2️⃣ Création des bases de données secondaires...");
      for (const schema of restSchemas) {
        await createSingleDatabase(schema);
        // Court délai entre chaque création
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog("✅ Processus de création terminé.");
      
      // Vérifier si tout s'est bien passé
      const successCount = Object.values(results).filter(r => r.status === 'success').length;
      const totalCount = DATABASE_SCHEMAS.length;
      
      if (successCount === totalCount) {
        toast.success(`${successCount}/${totalCount} bases de données créées avec succès`, {
          description: "Votre application est prête à utiliser Notion"
        });
      } else if (successCount > 0) {
        toast.warning(`${successCount}/${totalCount} bases de données créées`, {
          description: "Certaines bases n'ont pas pu être créées"
        });
      } else {
        toast.error("Aucune base de données n'a pu être créée", {
          description: "Consultez les logs pour plus d'informations"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création des bases de données:", error);
      addLog(`❌ Erreur générale: ${error.message}`);
      
      toast.error("Erreur lors de la création des bases de données", {
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Fonction pour tester individuellement l'accès à une base de données
  const testDatabaseAccess = async (schema: DatabaseSchema) => {
    const dbId = localStorage.getItem(schema.storageKey);
    if (!dbId) {
      addLog(`⚠️ Base "${schema.name}": Aucun ID stocké`);
      return;
    }
    
    try {
      addLog(`🔍 Test d'accès à "${schema.name}" (${dbId})...`);
      const response = await notionApi.databases.retrieve(dbId, apiKey);
      
      if (response && response.id) {
        const dbName = response.title?.[0]?.plain_text || schema.name;
        addLog(`✅ Accès réussi à "${dbName}" (${dbId})`);
        updateDatabaseStatus(schema.key, 'success', { id: dbId });
        
        toast.success(`Base "${dbName}" accessible`, {
          description: `ID: ${dbId}`
        });
      }
    } catch (error) {
      addLog(`❌ Échec d'accès à "${schema.name}" (${dbId}): ${error.message}`);
      updateDatabaseStatus(schema.key, 'error', { error: error.message });
      
      toast.error(`Base "${schema.name}" inaccessible`, {
        description: error.message
      });
    }
  };

  // Tester l'accès à toutes les bases de données
  const testAllDatabases = async () => {
    if (!apiKey) {
      toast.error("Veuillez spécifier la clé API Notion");
      return;
    }
    
    setLogs([]);
    addLog("🔍 Test de l'accès aux bases de données...");
    
    // Désactiver le mode mock pour les tests réels
    if (notionApi.mockMode.isActive()) {
      addLog("⚠️ Mode mock désactivé pour les tests d'accès");
      notionApi.mockMode.forceReset();
    }
    
    // Tester d'abord la connexion à l'API
    const connectionOk = await testNotionConnection();
    if (!connectionOk) {
      toast.error("Impossible de se connecter à l'API Notion", {
        description: "Vérifiez votre clé API et réessayez"
      });
      return;
    }
    
    // Tester chaque base de données
    for (const schema of DATABASE_SCHEMAS) {
      await testDatabaseAccess(schema);
      // Court délai entre chaque test
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    addLog("✅ Tests d'accès terminés");
  };

  return (
    <div className="space-y-8">
      {/* Onglets pour la navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="status">Statut des bases</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
        </TabsList>
        
        {/* Onglet Configuration */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Notion</CardTitle>
              <CardDescription>
                Entrez les informations nécessaires pour créer les bases de données dans votre espace Notion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium">
                  Clé API Notion
                </label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="secret_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Créez une intégration Notion pour obtenir une clé API sur <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">notion.so/my-integrations</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="page-id" className="text-sm font-medium">
                  ID de la page parent
                </label>
                <Input
                  id="page-id"
                  placeholder="ID de la page où créer les bases..."
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Trouvez l'ID dans l'URL de votre page Notion: notion.so/workspace/<span className="font-mono">votre-id-de-page</span>
                </p>
              </div>
              
              {isMockMode && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle>Mode démonstration actif</AlertTitle>
                  <AlertDescription>
                    Le mode démonstration sera automatiquement désactivé pendant la création des bases de données.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={createDatabases} 
                disabled={isCreating || !pageId || !apiKey} 
                className="w-full sm:w-auto"
              >
                {isCreating ? 'Création en cours...' : 'Créer les bases de données'}
              </Button>
              <Button 
                variant="outline" 
                onClick={testAllDatabases} 
                disabled={isCreating || !apiKey} 
                className="w-full sm:w-auto"
              >
                Tester l'accès aux bases
              </Button>
            </CardFooter>
          </Card>
          
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>8 bases de données seront créées</AlertTitle>
            <AlertDescription>
              Cette opération va créer toutes les bases de données nécessaires au fonctionnement de l'application dans votre espace Notion.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        {/* Onglet Statut */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Statut des bases de données</CardTitle>
              <CardDescription>
                Vue d'ensemble de l'état de création des bases de données Notion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DATABASE_SCHEMAS.map((schema) => {
                  const result = results[schema.key] || { status: 'pending', id: null };
                  return (
                    <div key={schema.key} className="flex items-start space-x-4 p-3 rounded-md border">
                      <div className="flex-shrink-0 mt-1">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : result.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{schema.name}</h3>
                          <Badge variant={
                            result.status === 'success' ? 'default' : 
                            result.status === 'error' ? 'destructive' : 'outline'
                          }>
                            {result.status === 'success' ? 'Créée' : 
                             result.status === 'error' ? 'Erreur' : 'En attente'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500">{schema.description}</p>
                        
                        {result.id && (
                          <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                            {result.id}
                          </div>
                        )}
                        
                        {result.error && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {result.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => testDatabaseAccess(schema)} 
                          disabled={!result.id || isCreating}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de création</CardTitle>
              <CardDescription>
                Historique détaillé du processus de création des bases de données.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded border p-4">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun log disponible. Lancez une opération pour voir les logs.
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-sm">
                    {logs.map((log, index) => {
                      // Styliser différemment selon le contenu du log
                      const isError = log.includes('❌') || log.includes('Erreur');
                      const isSuccess = log.includes('✅') || log.includes('réussi');
                      const isWarning = log.includes('⚠️') || log.includes('attention');
                      
                      return (
                        <div 
                          key={index} 
                          className={`py-1 px-2 rounded ${
                            isError ? 'bg-red-50 text-red-800' : 
                            isSuccess ? 'bg-green-50 text-green-800' : 
                            isWarning ? 'bg-yellow-50 text-yellow-800' : ''
                          }`}
                        >
                          {log}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="justify-between">
              <p className="text-xs text-gray-500">{logs.length} entrées</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLogs([])} 
                disabled={logs.length === 0}
              >
                Effacer les logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotionDatabasesCreator;
