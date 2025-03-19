
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  NotionDiagnosticTool,
  NotionDatabaseStructureCheck,
  NotionConfig,
  NotionProxyConfigSection
} from '@/components/notion';
import { ProxyStatusIndicator } from '@/components/notion';
import { useNotion } from '@/contexts/NotionContext';

const NotionSettings: React.FC = () => {
  const { openConfig, closeConfig, status, showConfig } = useNotion();
  
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-tmw-darkgray">Configuration Notion</h1>
        <p className="text-muted-foreground mt-2">
          Paramètres et diagnostics de votre intégration Notion
        </p>
        
        {status.isMockMode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Mode démonstration actif</p>
              <p className="text-sm text-amber-700">
                L'application utilise des données simulées. Les modifications ne seront pas 
                enregistrées dans Notion.
              </p>
            </div>
          </div>
        )}
      </header>
      
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={openConfig}
          id="notion-config-button"
        >
          <Database size={16} />
          Configurer Notion
        </Button>
      </div>
      
      {/* Configuration Notion (modal) */}
      <NotionConfig 
        isOpen={showConfig} 
        onClose={closeConfig} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="structure">Structure BDD</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="structure">
              <div className="space-y-6">
                <NotionDatabaseStructureCheck />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analyse de structure</CardTitle>
                    <CardDescription>
                      Comment interpréter les résultats de l'analyse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-1.5">
                          <Database size={16} className="text-blue-500" />
                          Propriétés requises
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Au moins une propriété de type <strong>title</strong> (généralement nommée "Name" ou "Titre")</li>
                          <li>Pour utiliser le statut, une propriété <strong>select</strong> nommée "Status" ou "Statut"</li>
                          <li>Pour la description, une propriété <strong>rich_text</strong> nommée "Description"</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Conseils d'utilisation</h3>
                        <p className="text-muted-foreground mb-2">
                          Si vous rencontrez des erreurs 400 lors de la création, vérifiez:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>Que le nom exact de vos propriétés correspond à ce que l'application attend</li>
                          <li>Que le type de chaque propriété est correct (title, select, rich_text, etc.)</li>
                          <li>Que les propriétés select ont des options définies</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="diagnostic">
              <NotionDiagnosticTool onConfigClick={openConfig} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut de la connexion</CardTitle>
              <CardDescription>État des services Notion</CardDescription>
            </CardHeader>
            <CardContent>
              <ProxyStatusIndicator />
            </CardContent>
          </Card>
          
          <NotionProxyConfigSection />
        </div>
      </div>
    </div>
  );
};

export default NotionSettings;
