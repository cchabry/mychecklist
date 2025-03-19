
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileJson, Shield, Database, AlertTriangle, CheckCircle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { isOAuthToken, isIntegrationKey, verifyProxyDeployment } from '@/lib/notionProxy/config';
import { testNotionConnection } from '@/lib/notion/notionClient';
import { toast } from 'sonner';

const NotionDiagnosticTool = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [detailedLogs, setDetailedLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setDetailedLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  const runDiagnostic = async () => {
    setLoading(true);
    setResults(null);
    setDetailedLogs([]);
    
    try {
      addLog('Démarrage du diagnostic Notion');
      
      // Récupérer les infos de configuration
      const apiKey = localStorage.getItem('notion_api_key');
      const dbId = localStorage.getItem('notion_database_id');
      const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      
      addLog(`Configuration trouvée: API Key ${apiKey ? '✓' : '✗'}, DB ID ${dbId ? '✓' : '✗'}, Checklists DB ID ${checklistsDbId ? '✓' : '✗'}`);
      
      // Créer l'objet résultat
      const diagnosticResults: any = {
        timestamp: new Date().toISOString(),
        configuration: {
          apiKeyPresent: !!apiKey,
          apiKeyValid: false,
          apiKeyType: 'inconnu',
          dbIdPresent: !!dbId,
          checklistsDbIdPresent: !!checklistsDbId,
          mockMode: notionApi.mockMode.isActive()
        },
        connectivity: {
          proxyWorking: false,
          corsWorking: false,
          notionAPIReachable: false
        },
        permissions: {
          canRead: false,
          canWrite: false,
          projectsDatabaseAccessible: false,
          checklistsDatabaseAccessible: checklistsDbId ? false : null
        },
        databaseStructure: {
          projectsDbChecked: false,
          checklistsDbChecked: false,
          projectsProperties: null,
          checklistsProperties: null
        }
      };
      
      // Vérifier le type de clé API
      if (apiKey) {
        if (isOAuthToken(apiKey)) {
          diagnosticResults.configuration.apiKeyType = 'OAuth Token (ntn_)';
          addLog('Clé API de type OAuth Token (ntn_) détectée');
        } else if (isIntegrationKey(apiKey)) {
          diagnosticResults.configuration.apiKeyType = 'Integration Key (secret_)';
          addLog('Clé API de type Integration Key (secret_) détectée');
        } else {
          diagnosticResults.configuration.apiKeyType = 'Format inconnu';
          addLog('⚠️ Format de clé API inconnu détecté');
        }
      }
      
      // Vérifier le déploiement du proxy
      try {
        addLog('Vérification du déploiement du proxy...');
        const proxyWorking = await verifyProxyDeployment(false, apiKey);
        diagnosticResults.connectivity.proxyWorking = proxyWorking;
        addLog(`Déploiement du proxy: ${proxyWorking ? '✓' : '✗'}`);
      } catch (proxyError) {
        addLog(`⚠️ Erreur lors de la vérification du proxy: ${proxyError.message}`);
      }
      
      // Test CORS direct (sera probablement bloqué, mais on essaie)
      try {
        addLog('Test CORS direct vers l\'API Notion...');
        const corsResponse = await fetch('https://api.notion.com/v1/users/me', {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${apiKey || 'dummy_key'}`,
            'Notion-Version': '2022-06-28'
          }
        });
        diagnosticResults.connectivity.corsWorking = corsResponse.status !== 0;
        addLog(`Test CORS direct: ${diagnosticResults.connectivity.corsWorking ? '✓' : '✗'} (statut: ${corsResponse.status})`);
      } catch (corsError) {
        addLog(`⚠️ Erreur CORS attendue: ${corsError.message}`);
        diagnosticResults.connectivity.corsWorking = false;
      }
      
      // Test complet de connexion Notion
      if (apiKey && dbId) {
        addLog('Exécution du test complet de connexion Notion...');
        try {
          const connectionTest = await testNotionConnection();
          
          if (connectionTest.success) {
            addLog(`✓ Test de connexion réussi. Utilisateur: ${connectionTest.user}`);
            diagnosticResults.connectivity.notionAPIReachable = true;
            diagnosticResults.configuration.apiKeyValid = true;
            diagnosticResults.permissions.canRead = true;
            diagnosticResults.permissions.projectsDatabaseAccessible = true;
            
            if (connectionTest.hasChecklistsDb) {
              diagnosticResults.permissions.checklistsDatabaseAccessible = true;
              addLog(`✓ Accès à la base de données des checklists: ${connectionTest.checklistsDbName}`);
            }
            
            addLog(`✓ Accès à la base de données des projets: ${connectionTest.projectsDbName}`);
          } else {
            addLog(`✗ Test de connexion échoué: ${connectionTest.error}`);
            addLog(`Détails: ${connectionTest.details || 'Aucun détail disponible'}`);
            
            // Si l'accès à la base de projets a réussi mais pas celle des checklists
            if (connectionTest.projectsDbAccess) {
              diagnosticResults.connectivity.notionAPIReachable = true;
              diagnosticResults.configuration.apiKeyValid = true;
              diagnosticResults.permissions.canRead = true;
              diagnosticResults.permissions.projectsDatabaseAccessible = true;
              diagnosticResults.permissions.checklistsDatabaseAccessible = false;
              
              addLog('✓ Accès à la base de données des projets OK, mais problème avec la base des checklists');
            }
          }
        } catch (testError) {
          addLog(`✗ Erreur lors du test de connexion: ${testError.message}`);
        }
      }
      
      // Test d'écriture si la lecture fonctionne
      if (diagnosticResults.permissions.canRead && apiKey && dbId) {
        addLog('Test d\'écriture Notion...');
        try {
          const timestamp = new Date().toISOString();
          const testPageData = {
            parent: { database_id: dbId },
            properties: {
              Name: {
                title: [{ text: { content: `Test diagnostic ${timestamp}` } }]
              },
              Status: {
                select: { name: "Test" }
              }
            }
          };
          
          addLog(`Tentative de création d'une page de test dans la base ${dbId}`);
          const createResponse = await notionApi.pages.create(testPageData, apiKey);
          
          if (createResponse && createResponse.id) {
            addLog(`✓ Test d'écriture réussi! ID de page: ${createResponse.id}`);
            diagnosticResults.permissions.canWrite = true;
            
            // Tentative de suppression (archive)
            try {
              await notionApi.pages.update(createResponse.id, { archived: true }, apiKey);
              addLog('✓ Nettoyage: Page de test archivée avec succès');
            } catch (archiveError) {
              addLog(`⚠️ Impossible d'archiver la page de test: ${archiveError.message}`);
            }
          }
        } catch (writeError) {
          addLog(`✗ Test d'écriture échoué: ${writeError.message}`);
          
          if (writeError.message?.includes('403')) {
            addLog('⚠️ Erreur 403: Cela suggère un problème de permissions. Vérifiez que l\'intégration est bien connectée à la base de données.');
          }
        }
      }
      
      // Vérification de la structure des bases de données
      if (diagnosticResults.permissions.projectsDatabaseAccessible && apiKey && dbId) {
        addLog('Analyse de la structure de la base de données des projets...');
        try {
          const dbDetails = await notionApi.databases.retrieve(dbId, apiKey);
          diagnosticResults.databaseStructure.projectsDbChecked = true;
          diagnosticResults.databaseStructure.projectsProperties = dbDetails.properties;
          
          // Analyser les propriétés requises
          const requiredProps = Object.entries(dbDetails.properties)
            .filter(([_, prop]: [string, any]) => prop.type === 'title' || (prop.type === 'rich_text' && prop.rich_text?.is_required))
            .map(([name, _]: [string, any]) => name);
          
          addLog(`Structure de la base de données des projets récupérée (${Object.keys(dbDetails.properties).length} propriétés)`);
          addLog(`Propriétés potentiellement requises: ${requiredProps.join(', ') || 'Aucune'}`);
        } catch (dbError) {
          addLog(`✗ Erreur lors de l'analyse de la base de données des projets: ${dbError.message}`);
        }
      }
      
      if (diagnosticResults.permissions.checklistsDatabaseAccessible && apiKey && checklistsDbId) {
        addLog('Analyse de la structure de la base de données des checklists...');
        try {
          const checklistsDbDetails = await notionApi.databases.retrieve(checklistsDbId, apiKey);
          diagnosticResults.databaseStructure.checklistsDbChecked = true;
          diagnosticResults.databaseStructure.checklistsProperties = checklistsDbDetails.properties;
          
          addLog(`Structure de la base de données des checklists récupérée (${Object.keys(checklistsDbDetails.properties).length} propriétés)`);
        } catch (dbError) {
          addLog(`✗ Erreur lors de l'analyse de la base de données des checklists: ${dbError.message}`);
        }
      }
      
      // Enregistrer les résultats
      setResults(diagnosticResults);
      addLog('Diagnostic terminé!');
      
      toast.success('Diagnostic Notion terminé', {
        description: 'Les résultats sont disponibles ci-dessous.'
      });
    } catch (error) {
      addLog(`❌ Erreur générale durant le diagnostic: ${error.message}`);
      toast.error('Erreur lors du diagnostic', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson size={18} />
          Outil de diagnostic Notion
        </CardTitle>
        <CardDescription>
          Analyse complète de l'intégration avec Notion et identification des problèmes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="mb-4 w-full"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Diagnostic en cours...
            </>
          ) : (
            'Démarrer le diagnostic'
          )}
        </Button>
        
        {results && (
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Résumé</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <div className="space-y-4">
                <section>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-blue-500" />
                    Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Clé API</span>
                      <Badge variant={results.configuration.apiKeyPresent ? "default" : "destructive"}>
                        {results.configuration.apiKeyPresent ? "Présente" : "Manquante"}
                      </Badge>
                    </div>
                    
                    {results.configuration.apiKeyPresent && (
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-xs">Type</span>
                        <Badge variant="outline">{results.configuration.apiKeyType}</Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Base de données projets</span>
                      <Badge variant={results.configuration.dbIdPresent ? "default" : "destructive"}>
                        {results.configuration.dbIdPresent ? "Configurée" : "Non configurée"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Base de données checklists</span>
                      <Badge variant={results.configuration.checklistsDbIdPresent ? "default" : "secondary"}>
                        {results.configuration.checklistsDbIdPresent ? "Configurée" : "Optionnelle"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Mode démonstration</span>
                      <Badge variant={!results.configuration.mockMode ? "default" : "secondary"}>
                        {!results.configuration.mockMode ? "Désactivé" : "Activé"}
                      </Badge>
                    </div>
                  </div>
                </section>
                
                <Separator />
                
                <section>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Database size={16} className="text-green-500" />
                    Connectivité
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Proxy</span>
                      <Badge variant={results.connectivity.proxyWorking ? "default" : "destructive"}>
                        {results.connectivity.proxyWorking ? "Fonctionnel" : "Problème"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">API Notion accessible</span>
                      <Badge variant={results.connectivity.notionAPIReachable ? "default" : "destructive"}>
                        {results.connectivity.notionAPIReachable ? "Oui" : "Non"}
                      </Badge>
                    </div>
                  </div>
                </section>
                
                <Separator />
                
                <section>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Permissions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Lecture</span>
                      <Badge variant={results.permissions.canRead ? "default" : "destructive"}>
                        {results.permissions.canRead ? "Autorisée" : "Refusée"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Écriture</span>
                      <Badge variant={results.permissions.canWrite ? "default" : "destructive"}>
                        {results.permissions.canWrite ? "Autorisée" : "Refusée"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs">Accès BDD projets</span>
                      <Badge variant={results.permissions.projectsDatabaseAccessible ? "default" : "destructive"}>
                        {results.permissions.projectsDatabaseAccessible ? "OK" : "Refusé"}
                      </Badge>
                    </div>
                    
                    {results.configuration.checklistsDbIdPresent && (
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-xs">Accès BDD checklists</span>
                        <Badge variant={results.permissions.checklistsDatabaseAccessible ? "default" : "destructive"}>
                          {results.permissions.checklistsDatabaseAccessible ? "OK" : "Refusé"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </section>
              </div>
              
              {/* Recommandations basées sur les résultats */}
              {results && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-3">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Recommandations</h3>
                  
                  <ul className="space-y-2 text-xs text-blue-700">
                    {!results.permissions.canWrite && results.permissions.canRead && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>
                          <strong>Problème d'écriture détecté</strong> - Vérifiez que votre intégration est bien connectée 
                          à la base de données dans Notion (menu "..." &gt; "Connexions").
                        </span>
                      </li>
                    )}
                    
                    {results.connectivity.notionAPIReachable && !results.permissions.projectsDatabaseAccessible && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>
                          <strong>Problème d'accès à la base de données</strong> - L'ID de base de données semble invalide 
                          ou votre intégration n'y a pas accès.
                        </span>
                      </li>
                    )}
                    
                    {!results.connectivity.notionAPIReachable && (
                      <li className="flex items-start gap-2">
                        <XCircle size={14} className="flex-shrink-0 mt-0.5 text-red-500" />
                        <span>
                          <strong>API Notion inaccessible</strong> - Vérifiez votre connexion internet et la validité 
                          de votre clé API.
                        </span>
                      </li>
                    )}
                    
                    {!results.connectivity.proxyWorking && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>
                          <strong>Problème de proxy</strong> - Le proxy CORS ne fonctionne pas correctement. 
                          Essayez de changer de proxy dans les paramètres.
                        </span>
                      </li>
                    )}
                    
                    {results.permissions.canRead && results.permissions.canWrite && results.permissions.projectsDatabaseAccessible && (
                      <li className="flex items-start gap-2">
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-green-500" />
                        <span>
                          <strong>Configuration correcte</strong> - Votre intégration Notion semble fonctionner correctement!
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              {results && results.databaseStructure.projectsDbChecked && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="projects-db">
                    <AccordionTrigger className="text-sm">Structure de la base de données des projets</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(results.databaseStructure.projectsProperties, null, 2)}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {results.databaseStructure.checklistsDbChecked && (
                    <AccordionItem value="checklists-db">
                      <AccordionTrigger className="text-sm">Structure de la base de données des checklists</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                          <pre>{JSON.stringify(results.databaseStructure.checklistsProperties, null, 2)}</pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  <AccordionItem value="full-results">
                    <AccordionTrigger className="text-sm">Résultats complets</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(results, null, 2)}</pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              
              {(!results || !results.databaseStructure.projectsDbChecked) && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <HelpCircle size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Aucune information détaillée disponible</p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="logs" className="mt-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 h-80 overflow-y-auto">
                {detailedLogs.length > 0 ? (
                  <div className="space-y-1 text-xs font-mono">
                    {detailedLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">{log}</div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Aucun log disponible</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Actualiser la page
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionDiagnosticTool;
