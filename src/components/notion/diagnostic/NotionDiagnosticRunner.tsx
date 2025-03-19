
import React, { useState, useEffect } from 'react';
import { TestResult } from './NotionTestResult';
import { useNotion } from '@/contexts/NotionContext';
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { toast } from 'sonner';

export interface DiagnosticResults {
  configTests: TestResult[];
  connectivityTests: TestResult[];
  permissionTests: TestResult[];
  structureTests: TestResult[];
}

interface NotionDiagnosticRunnerProps {
  onComplete: (results: DiagnosticResults) => void;
  persistCreatedPage?: boolean;
}

const NotionDiagnosticRunner: React.FC<NotionDiagnosticRunnerProps> = ({ 
  onComplete,
  persistCreatedPage = false
}) => {
  const { config } = useNotion();
  const [createdPageInfo, setCreatedPageInfo] = useState<{id: string; title: string} | null>(null);
  
  const runDiagnostics = async () => {
    const initialResults: DiagnosticResults = {
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
    };
    
    onComplete(initialResults);
    
    const apiKey = config.apiKey;
    const projectsDbId = config.databaseId;
    const checklistsDbId = config.checklistsDbId;
    
    const wasMockMode = notionApi.mockMode.isActive();
    if (wasMockMode) {
      localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
      notionApi.mockMode.forceReset();
    }
    
    try {
      // 1. Tests de configuration
      const configResults = [...initialResults.configTests];
      
      if (apiKey) {
        configResults[0] = { 
          ...initialResults.configTests[0], 
          status: 'success',
          details: `Clé API trouvée: ${apiKey.substring(0, 8)}...`
        };
      } else {
        configResults[0] = { 
          ...initialResults.configTests[0], 
          status: 'error',
          details: 'Aucune clé API trouvée dans le stockage local'
        };
      }
      
      if (projectsDbId) {
        configResults[1] = { 
          ...initialResults.configTests[1], 
          status: 'success',
          details: `ID de base de données Projets: ${projectsDbId.substring(0, 8)}...`
        };
      } else {
        configResults[1] = { 
          ...initialResults.configTests[1], 
          status: 'error',
          details: 'Aucun ID de base de données Projets trouvé'
        };
      }
      
      if (checklistsDbId) {
        configResults[2] = { 
          ...initialResults.configTests[2], 
          status: 'success',
          details: `ID de base de données Checklists: ${checklistsDbId.substring(0, 8)}...`
        };
      } else {
        configResults[2] = { 
          ...initialResults.configTests[2], 
          status: 'warning',
          details: 'Base de données Checklists non configurée (optionnelle)'
        };
      }
      
      // Mise à jour des résultats
      onComplete({
        ...initialResults,
        configTests: configResults
      });
      
      // 2. Tests de connectivité (uniquement si API key existe)
      if (apiKey) {
        const connectivityResults = [...initialResults.connectivityTests];
        
        // Test du proxy
        try {
          const response = await fetch('/api/ping');
          
          if (response.ok) {
            connectivityResults[0] = { 
              ...initialResults.connectivityTests[0], 
              status: 'success',
              details: 'Proxy API accessible'
            };
          } else {
            connectivityResults[0] = { 
              ...initialResults.connectivityTests[0], 
              status: 'error',
              details: `Erreur du proxy: ${response.status} ${response.statusText}`
            };
          }
        } catch (proxyError) {
          connectivityResults[0] = { 
            ...initialResults.connectivityTests[0], 
            status: 'error',
            details: `Erreur du proxy: ${proxyError.message || 'Inaccessible'}`
          };
        }
        
        // Test d'authentification
        try {
          const user = await notionApi.users.me(apiKey);
          
          if (user && user.id) {
            connectivityResults[1] = { 
              ...initialResults.connectivityTests[1], 
              status: 'success',
              details: `Authentifié en tant que: ${user.name || user.id}`
            };
          } else {
            connectivityResults[1] = { 
              ...initialResults.connectivityTests[1], 
              status: 'error',
              details: 'Échec d\'authentification: Réponse invalide'
            };
          }
        } catch (authError) {
          connectivityResults[1] = { 
            ...initialResults.connectivityTests[1], 
            status: 'error',
            details: `Échec d'authentification: ${authError.message || 'Erreur inconnue'}`
          };
        }
        
        // Mise à jour des résultats
        onComplete({
          ...initialResults,
          configTests: configResults,
          connectivityTests: connectivityResults
        });
      }
      
      // 3. Tests de permissions (uniquement si API key et DB ID existent)
      if (apiKey && projectsDbId) {
        const permissionResults = [...initialResults.permissionTests];
        
        // Test de lecture
        try {
          const dbInfo = await notionApi.databases.retrieve(projectsDbId, apiKey);
          
          if (dbInfo && dbInfo.id) {
            permissionResults[0] = { 
              ...initialResults.permissionTests[0], 
              status: 'success',
              details: `Accès en lecture confirmé: ${dbInfo.title?.[0]?.plain_text || dbInfo.id}`
            };
          } else {
            permissionResults[0] = { 
              ...initialResults.permissionTests[0], 
              status: 'error',
              details: 'Échec de lecture: Réponse invalide'
            };
          }
        } catch (readError) {
          permissionResults[0] = { 
            ...initialResults.permissionTests[0], 
            status: 'error',
            details: `Échec de lecture: ${readError.message || 'Erreur inconnue'}`
          };
        }
        
        // Test d'écriture
        try {
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
          
          const createdPage = await notionApi.pages.create(createData, apiKey);
          
          if (createdPage && createdPage.id) {
            let successMessage = `Test d'écriture réussi: Page créée avec ID ${createdPage.id.substring(0, 8)}...`;
            
            if (!persistCreatedPage) {
              try {
                await notionApi.pages.update(createdPage.id, {
                  archived: true
                }, apiKey);
                successMessage += " (page archivée)";
              } catch (archiveError) {
                successMessage += " (impossible d'archiver la page)";
              }
            } else {
              setCreatedPageInfo({
                id: createdPage.id,
                title: testTitle
              });
              successMessage += " (page conservée dans la base de données)";
            }
            
            permissionResults[1] = { 
              ...initialResults.permissionTests[1], 
              status: 'success',
              details: successMessage
            };
          } else {
            permissionResults[1] = { 
              ...initialResults.permissionTests[1], 
              status: 'error',
              details: 'Échec d\'écriture: Réponse invalide'
            };
          }
        } catch (writeError) {
          permissionResults[1] = { 
            ...initialResults.permissionTests[1], 
            status: 'error',
            details: `Échec d'écriture: ${writeError.message || 'Erreur inconnue'}`
          };
        }
        
        // Mise à jour des résultats
        onComplete({
          ...initialResults,
          configTests: configResults,
          connectivityTests: initialResults.connectivityTests,
          permissionTests: permissionResults
        });
      }
      
      // 4. Tests de structure de la base de données
      if (apiKey && projectsDbId) {
        const structureResults = [...initialResults.structureTests];
        
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
                ...initialResults.structureTests[0], 
                status: 'success',
                details: 'Structure de la base de données de projets valide'
              };
            } else {
              structureResults[0] = { 
                ...initialResults.structureTests[0], 
                status: 'warning',
                details: `Propriétés manquantes: ${missingProps.join(', ')}`
              };
            }
          } else {
            structureResults[0] = { 
              ...initialResults.structureTests[0], 
              status: 'error',
              details: 'Impossible de vérifier la structure: Réponse invalide'
            };
          }
        } catch (structureError) {
          structureResults[0] = { 
            ...initialResults.structureTests[0], 
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
                  ...initialResults.structureTests[1], 
                  status: 'success',
                  details: 'Structure de la base de données de checklists valide'
                };
              } else {
                structureResults[1] = { 
                  ...initialResults.structureTests[1], 
                  status: 'warning',
                  details: `Propriétés manquantes: ${missingProps.join(', ')}`
                };
              }
            } else {
              structureResults[1] = { 
                ...initialResults.structureTests[1], 
                status: 'error',
                details: 'Impossible de vérifier la structure: Réponse invalide'
              };
            }
          } catch (structureError) {
            structureResults[1] = { 
              ...initialResults.structureTests[1], 
              status: 'error',
              details: `Erreur de vérification de structure: ${structureError.message || 'Erreur inconnue'}`
            };
          }
        } else {
          structureResults[1] = { 
            ...initialResults.structureTests[1], 
            status: 'warning',
            details: 'Base de données de checklists non configurée (optionnelle)'
          };
        }
        
        // Mise à jour finale des résultats
        onComplete({
          configTests: configResults,
          connectivityTests: initialResults.connectivityTests,
          permissionTests: initialResults.permissionTests,
          structureTests: structureResults
        });
      }
      
      // Restaurer le mode mock si nécessaire
      if (wasMockMode) {
        notionApi.mockMode.activate();
      }
      
      toast.success('Diagnostics terminés', {
        description: 'Tous les tests ont été exécutés'
      });
      
    } catch (error) {
      // En cas d'erreur globale, notification
      toast.error('Erreur lors des diagnostics', {
        description: error.message || 'Une erreur est survenue pendant les tests'
      });
      
      // Restaurer le mode mock si nécessaire
      if (wasMockMode) {
        notionApi.mockMode.activate();
      }
    }
  };
  
  useEffect(() => {
    runDiagnostics();
  }, [persistCreatedPage]);
  
  return null; // Ce composant n'affiche rien, il exécute juste les tests
};

export default NotionDiagnosticRunner;
