
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionCreatePageTest, NotionDiagnosticTool } from '@/components/notion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotionConfig } from '@/components/notion';
import { Button } from '@/components/ui/button';
import { Settings, Database, AlertTriangle } from 'lucide-react';
import { mockMode } from '@/lib/notionProxy/mockMode';

const HomePage = () => {
  const [configOpen, setConfigOpen] = React.useState(false);
  
  // Vérifier l'état du mode mock
  const isMockMode = mockMode.isActive();
  
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-tmw-darkgray">Diagnostics Notion</h1>
        <p className="text-muted-foreground mt-2">
          Outils pour tester et diagnostiquer l'intégration avec Notion
        </p>
        
        {isMockMode && (
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
          onClick={() => setConfigOpen(true)}
          id="notion-config-button"
        >
          <Settings size={16} />
          Configurer Notion
        </Button>
      </div>
      
      {/* Configuration Notion (modal) */}
      <NotionConfig 
        isOpen={configOpen} 
        onClose={() => setConfigOpen(false)} 
      />
      
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="tests">Tests rapides</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic complet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <NotionCreatePageTest />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Réinitialiser le mode</CardTitle>
                <CardDescription>
                  Réinitialiser complètement le mode d'intégration Notion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Réinitialise complètement la configuration du mode (mock ou réel) et force
                  le mode réel si Notion est configuré.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => {
                    mockMode.forceReset();
                    window.location.reload();
                  }}
                >
                  <Database size={16} />
                  Forcer le mode réel
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="diagnostic">
          <NotionDiagnosticTool onConfigClick={() => setConfigOpen(true)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomePage;
