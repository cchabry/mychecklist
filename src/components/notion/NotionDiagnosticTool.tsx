import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, Loader2, Database, RefreshCw, Save, Lock } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import NotionCreatePageTest from './NotionCreatePageTest';

interface NotionDiagnosticToolProps {
  onConfigClick?: () => void; // Prop for configuration button
}

const NotionDiagnosticTool: React.FC<NotionDiagnosticToolProps> = ({ onConfigClick }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [persistCreatedPage, setPersistCreatedPage] = useState(false);
  const [createdPageInfo, setCreatedPageInfo] = useState<{id: string; title: string} | null>(null);
  const [results, setResults] = useState<{
    configTests: TestResult[];
    connectivityTests: TestResult[];
    permissionTests: TestResult[];
    structureTests: TestResult[];
  }>({
    configTests: [],
    connectivityTests: [],
    permissionTests: [],
    structureTests: []
  });
  
  interface TestResult {
    name: string;
    description: string;
    status: 'pending' | 'success' | 'warning' | 'error';
    details?: string;
  }
  
  const runDiagnostics = async () => {
    setIsRunning(true);
    setCreatedPageInfo(null);
    
    // Réinitialiser les résultats
    setResults({
      configTests: [
        { name: 'Clé API', description: 'Vérifie si une clé API est configurée', status: 'pending' },
        { name: 'Base de données', description: 'Vérifie si une DB Projets est configurée', status: 'pending' },
        { name: 'Base de Checklists', description: 'Vérifie si une DB Checklists est configurée', status: 'pending' }
      ],
      connectivityTests: [
        { name: 'Proxy API', description: 'Vérifie la disponibilité du proxy', status: 'pending' },
        { name: 'Authentification', description: 'Vérifie l\'authentification Notion', status: 'pending' }
      ],
      permissionTests: [
        { name: 'Lecture Projets', description: 'Vérifie les permissions de lecture', status: 'pending' },
        { name: 'Écriture Projets', description: 'Vérifie les permissions d\'écriture', status: 'pending' }
      ],
      structureTests: [
        { name: 'Format Projets', description: 'Vérifie la structure de la DB Projets', status: 'pending' },
        { name: 'Format Checklists', description: 'Vérifie la structure de la DB Checklists', status: 'pending' }
      ]
    });
    
    // Obtenir tous les paramètres nécessaires
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
    
    // Désactiver temporairement le mode mock si actif
    const wasMockMode = notionApi.mockMode.isActive();
    if (wasMockMode) {
      console.log('💡 Désactivation temporaire du mode mock pour les diagnostics');
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      notionApi.mockMode.forceReset();
    }
    
    // 1. Tests de configuration
    try {
      // Test 1.1: Clé API
      const configResults = [...results.configTests];
      
      if (apiKey) {
        configResults[0] = { 
          ...results.configTests[0], 
          status: 'success',
          details: `Clé API trouvée: ${apiKey.substring(0, 8)}...`
        };
      } else {
        configResults[0] = { 
          ...results.configTests[0], 
          status: 'error',
          details: 'Aucune clé API trouvée dans le stockage local'
        };
      }
      
      // Test 1.2: Base de données projets
      if (projectsDbId) {
        configResults[1] = { 
          ...results.configTests[1], 
          status: 'success',
          details: `ID de base de données Projets: ${projectsDbId.substring(0, 8)}...`
        };
      } else {
        configResults[1] = { 
          ...results.configTests[1], 
          status: 'error',
          details: 'Aucun ID de base de données Projets trouvé'
        };
      }
      
      // Test 1.3: Base de données checklists
      if (checklistsDbId) {
        configResults[2] = { 
          ...results.configTests[2], 
          status: 'success',
          details: `ID de base de données Checklists: ${checklistsDbId.substring(0, 8)}...`
        };
      } else {
        configResults[2] = { 
          ...results.configTests[2], 
          status: 'warning',
          details: 'Base de données Checklists non configurée (optionnelle)'
        };
      }
      
      setResults(prev => ({...prev, configTests: configResults}));
    } catch (error) {
      console.error('Erreur lors des tests de configuration:', error);
    }
    
    // 2. Tests de connectivité
    if (apiKey) {
      try {
        // Test 2.1: Proxy API
        const connectivityResults = [...results.connectivityTests];
        
        try {
          // Essayer de faire une requête simple
          const response = await fetch('/api/ping');
          
          if (response.ok) {
            connectivityResults[0] = { 
              ...results.connectivityTests[0], 
              status: 'success',
              details: 'Proxy API accessible'
            };
          } else {
            connectivityResults[0] = { 
              ...results.connectivityTests[0], 
              status: 'error',
              details: `Erreur du proxy: ${response.status} ${response.statusText}`
            };
          }
        } catch (proxyError) {
          connectivityResults[0] = { 
            ...results.connectivityTests[0], 
            status: 'error',
            details: `Erreur du proxy: ${proxyError.message || 'Inaccessible'}`
          };
        }
        
        // Test 2.2: Authentification Notion
        try {
          // Tenter d'obtenir les informations utilisateur
          const user = await notionApi.users.me(apiKey);
          
          if (user && user.id) {
            connectivityResults[1] = { 
              ...results.connectivityTests[1], 
              status: 'success',
              details: `Authentifié en tant que: ${user.name || user.id}`
            };
          } else {
            connectivityResults[1] = { 
              ...results.connectivityTests[1], 
              status: 'error',
              details: 'Échec d\'authentification: Réponse invalide'
            };
          }
        } catch (authError) {
          connectivityResults[1] = { 
            ...results.connectivityTests[1], 
            status: 'error',
            details: `Échec d'authentification: ${authError.message || 'Erreur inconnue'}`
          };
        }
        
        setResults(prev => ({...prev, connectivityTests: connectivityResults}));
      } catch (error) {
        console.error('Erreur lors des tests de connectivité:', error);
      }
    }
    
    // 3. Tests de permissions
    if (apiKey && projectsDbId) {
      try {
        const permissionResults = [...results.permissionTests];
        
        // Test 3.1: Lecture des projets
        try {
          // Tenter de récupérer les détails de la base de données
          const dbInfo = await notionApi.databases.retrieve(projectsDbId, apiKey);
          
          if (dbInfo && dbInfo.id) {
            permissionResults[0] = { 
              ...results.permissionTests[0], 
              status: 'success',
              details: `Accès en lecture confirmé: ${dbInfo.title?.[0]?.plain_text || dbInfo.id}`
            };
          } else {
            permissionResults[0] = { 
              ...results.permissionTests[0], 
              status: 'error',
              details: 'Échec de lecture: Réponse invalide'
            };
          }
        } catch (readError) {
          permissionResults[0] = { 
            ...results.permissionTests[0], 
            status: 'error',
            details: `Échec de lecture: ${readError.message || 'Erreur inconnue'}`
          };
        }
        
        // Test 3.2: Écriture dans les projets
        try {
          // Tenter de créer une page test
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
          
          console.log('📝 Test d\'écriture avec données:', JSON.stringify(createData, null, 2));
          
          const createdPage = await notionApi.pages.create(createData, apiKey);
          
          if (createdPage && createdPage.id) {
            let successMessage = `Test d'écriture réussi: Page créée avec ID ${createdPage.id.substring(0, 8)}...`;
            
            // Si on ne veut pas persister, archiver la page
            if (!persistCreatedPage) {
              try {
                await notionApi.pages.update(createdPage.id, {
                  archived: true
                }, apiKey);
                successMessage += " (page archivée)";
              } catch (archiveError) {
                console.warn('Impossible d\'archiver la page de test:', archiveError);
                successMessage += " (impossible d'archiver la page)";
              }
            } else {
              // Garder l'information de la page créée
              setCreatedPageInfo({
                id: createdPage.id,
                title: testTitle
              });
              successMessage += " (page conservée dans la base de données)";
            }
            
            permissionResults[1] = { 
              ...results.permissionTests[1], 
              status: 'success',
              details: successMessage
            };
          } else {
            permissionResults[1] = { 
              ...results.permissionTests[1], 
              status: 'error',
              details: 'Échec d\'écriture: Réponse invalide'
            };
          }
        } catch (writeError) {
          permissionResults[1] = { 
            ...results.permissionTests[1], 
            status: 'error',
            details: `Échec d'écriture: ${writeError.message || 'Erreur inconnue'}`
          };
        }
        
        setResults(prev => ({...prev, permissionTests: permissionResults}));
      } catch (error) {
        console.error('Erreur lors des tests de permissions:', error);
      }
    }
    
    // 4. Tests de structure
    if (apiKey && projectsDbId) {
      try {
        const structureResults = [...results.structureTests];
        
        // Test 4.1: Structure de la base de données de projets
        try {
          // Vérifier si la base de données a les propriétés requises
          const dbInfo = await notionApi.databases.retrieve(projectsDbId, apiKey);
          
          if (dbInfo && dbInfo.properties) {
            // Vérifier si les propriétés nécessaires sont présentes
            const requiredProps = ['Name', 'id', 'url', 'progress', 'itemsCount'];
            const missingProps = requiredProps.filter(prop => 
              !Object.keys(dbInfo.properties).some(key => 
                key.toLowerCase() === prop.toLowerCase()
              )
            );
            
            if (missingProps.length === 0) {
              structureResults[0] = { 
                ...results.structureTests[0], 
                status: 'success',
                details: 'Structure de la base de données de projets valide'
              };
            } else {
              structureResults[0] = { 
                ...results.structureTests[0], 
                status: 'warning',
                details: `Propriétés manquantes: ${missingProps.join(', ')}`
              };
            }
          } else {
            structureResults[0] = { 
              ...results.structureTests[0], 
              status: 'error',
              details: 'Impossible de vérifier la structure: Réponse invalide'
            };
          }
        } catch (structureError) {
          structureResults[0] = { 
            ...results.structureTests[0], 
            status: 'error',
            details: `Erreur de vérification de structure: ${structureError.message || 'Erreur inconnue'}`
          };
        }
        
        // Test 4.2: Structure de la base de données de checklists (si configurée)
        if (checklistsDbId) {
          try {
            // Vérifier si la base de données a les propriétés requises
            const checklistDbInfo = await notionApi.databases.retrieve(checklistsDbId, apiKey);
            
            if (checklistDbInfo && checklistDbInfo.properties) {
              // Vérifier si les propriétés nécessaires sont présentes
              const requiredProps = ['ID', 'Consigne', 'Catégorie'];
              const missingProps = requiredProps.filter(prop => 
                !Object.keys(checklistDbInfo.properties).some(key => 
                  key.toLowerCase() === prop.toLowerCase()
                )
              );
              
              if (missingProps.length === 0) {
                structureResults[1] = { 
                  ...results.structureTests[1], 
                  status: 'success',
                  details: 'Structure de la base de données de checklists valide'
                };
              } else {
                structureResults[1] = { 
                  ...results.structureTests[1], 
                  status: 'warning',
                  details: `Propriétés manquantes: ${missingProps.join(', ')}`
                };
              }
            } else {
              structureResults[1] = { 
                ...results.structureTests[1], 
                status: 'error',
                details: 'Impossible de vérifier la structure: Réponse invalide'
              };
            }
          } catch (structureError) {
            structureResults[1] = { 
              ...results.structureTests[1], 
              status: 'error',
              details: `Erreur de vérification de structure: ${structureError.message || 'Erreur inconnue'}`
            };
          }
        } else {
          structureResults[1] = { 
            ...results.structureTests[1], 
            status: 'warning',
            details: 'Base de données de checklists non configurée (optionnelle)'
          };
        }
        
        setResults(prev => ({...prev, structureTests: structureResults}));
      } catch (error) {
        console.error('Erreur lors des tests de structure:', error);
      }
    }
    
    // Restaurer le mode mock si nécessaire
    if (wasMockMode) {
      console.log('💡 Restauration du mode mock après les diagnostics');
      notionApi.mockMode.activate();
    }
    
    setIsRunning(false);
    
    // Notification de fin des tests
    toast.success('Diagnostics terminés', {
      description: 'Tous les tests ont été exécutés'
    });
  };
  
  // Exécuter les diagnostics au chargement initial
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const renderTestResult = (test: TestResult) => {
    const getIcon = () => {
      switch (test.status) {
        case 'success':
          return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case 'error':
          return <XCircle className="h-5 w-5 text-red-500" />;
        default:
          return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
      }
    };
    
    const getBadgeVariant = () => {
      switch (test.status) {
        case 'success':
          return "default" as const;
        case 'warning':
          return "secondary" as const;
        case 'error':
          return "destructive" as const;
        default:
          return "outline" as const;
      }
    };
    
    return (
      <div className="flex items-start space-x-3 py-2">
        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{test.name}</h4>
            <Badge variant={getBadgeVariant()}>
              {test.status === 'success' ? 'Succès' : 
                test.status === 'warning' ? 'Avertissement' : 
                test.status === 'error' ? 'Échec' : 'En cours'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{test.description}</p>
          {test.details && (
            <p className="mt-1 text-xs whitespace-pre-wrap bg-muted p-1.5 rounded">
              {test.details}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  // Calculer un résumé des résultats
  const summary = {
    success: Object.values(results).flatMap(group => group).filter(r => r.status === 'success').length,
    warning: Object.values(results).flatMap(group => group).filter(r => r.status === 'warning').length,
    error: Object.values(results).flatMap(group => group).filter(r => r.status === 'error').length,
    total: Object.values(results).flatMap(group => group).length
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-tmw-darkgray mb-4 flex items-center gap-2">
        <Database size={20} className="text-tmw-teal" />
        Diagnostics Notion
      </h2>
      
      <NotionCreatePageTest />
      
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Diagnostique de l'intégration Notion</CardTitle>
              <CardDescription>
                Vérification de la configuration et de la connectivité avec Notion
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={runDiagnostics}
                disabled={isRunning}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualiser
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${persistCreatedPage ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                onClick={() => setPersistCreatedPage(!persistCreatedPage)}
              >
                <Save className="h-4 w-4" />
                {persistCreatedPage ? 'Conserver les tests' : 'Archiver les tests'}
              </Button>
              
              {onConfigClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-tmw-teal border-tmw-teal/20 hover:bg-tmw-teal/5"
                  onClick={onConfigClick}
                >
                  <Database className="h-4 w-4" />
                  Configurer
                </Button>
              )}
            </div>
          </div>
          
          {!isRunning && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{summary.success} réussis</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>{summary.warning} avertissements</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{summary.error} échecs</span>
              </div>
            </div>
          )}
          
          {createdPageInfo && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
              <div className="font-medium text-green-800 mb-1">Page de test créée et conservée</div>
              <div className="text-green-700">
                <p>Titre: {createdPageInfo.title}</p>
                <p>ID: {createdPageInfo.id}</p>
                <p className="text-xs mt-1">La page a été conservée dans votre base de données pour vérification</p>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isRunning ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-tmw-teal" />
              <p className="mt-4 text-sm text-muted-foreground">Exécution des tests diagnostiques...</p>
            </div>
          ) :

