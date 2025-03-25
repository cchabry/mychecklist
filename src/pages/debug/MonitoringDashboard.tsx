
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorStatsDisplay from '@/components/notion/error/ErrorStatsDisplay';
import StructuredLogsDisplay from '@/components/notion/logging/StructuredLogsDisplay';
import { Button } from '@/components/ui/button';
import { Bug, Database, Activity, Play } from 'lucide-react';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { useErrorCounter } from '@/hooks/notion/useErrorCounter';
import { notionErrorService } from '@/services/notion/errorHandling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionErrorType, NotionErrorSeverity } from '@/services/notion/errorHandling/types';

/**
 * Page de tableau de bord pour le monitoring et les diagnostics
 */
const MonitoringDashboard: React.FC = () => {
  const { info, error } = useStructuredLogger();
  const { recordError } = useErrorCounter();
  
  // Générer des logs et erreurs de test
  const generateTestLogs = () => {
    info('Log de test généré manuellement', { timestamp: Date.now() }, {
      source: 'TestGenerator',
      tags: ['test', 'manual']
    });
    
    // Générer différents niveaux de logs
    for (let i = 0; i < 5; i++) {
      info(`Test log info #${i+1}`, { iteration: i }, {
        source: 'TestGenerator',
        tags: ['test', 'bulk']
      });
    }
    
    error('Erreur de test générée manuellement', new Error('Test error message'), {
      source: 'TestGenerator',
      tags: ['test', 'error', 'manual']
    });
  };
  
  // Générer une erreur pour le compteur
  const generateTestError = () => {
    // Créer une erreur de test
    const testError = new Error('Erreur de test pour le compteur');
    
    // Enregistrer l'erreur dans le compteur
    recordError(testError, '/api/test/endpoint');
    
    // Également la signaler au service d'erreur Notion
    notionErrorService.reportError(testError, 'Test d\'erreur');
  };
  
  // Générer une erreur avec un type spécifique
  const generateTypedError = (type: NotionErrorType) => {
    const error = notionErrorService.createError(`Erreur de test de type ${type}`, {
      type,
      severity: type === NotionErrorType.AUTH ? NotionErrorSeverity.CRITICAL : NotionErrorSeverity.ERROR,
      context: {
        testGenerated: true,
        timestamp: new Date().toISOString()
      },
      operation: `/api/test/${type}`
    });
    
    notionErrorService.reportError(error);
    recordError(error, `/api/test/${type}`);
  };
  
  // Simuler une activité régulière pour la démo
  useEffect(() => {
    const interval = setInterval(() => {
      info('Activité périodique de monitoring', { timestamp: Date.now() }, {
        source: 'MonitoringSystem',
        tags: ['background', 'heartbeat']
      });
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [info]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord de monitoring</h1>
        <p className="text-muted-foreground">
          Visualiser et analyser les logs et erreurs de l'application
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Outils de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={generateTestLogs}
            >
              <Database className="mr-2 h-4 w-4 text-blue-500" />
              Générer des logs de test
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={generateTestError}
            >
              <Bug className="mr-2 h-4 w-4 text-red-500" />
              Générer une erreur de test
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => generateTypedError(NotionErrorType.AUTH)}
            >
              <Activity className="mr-2 h-4 w-4 text-amber-500" />
              Simuler erreur d'authentification
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => generateTypedError(NotionErrorType.RATE_LIMIT)}
            >
              <Play className="mr-2 h-4 w-4 text-green-500" />
              Simuler erreur de limite d'API
            </Button>
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-3">
          <CardContent className="pt-6">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="stats">Statistiques d'erreurs</TabsTrigger>
                <TabsTrigger value="logs">Logs structurés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-0">
                <ErrorStatsDisplay />
              </TabsContent>
              
              <TabsContent value="logs" className="mt-0">
                <StructuredLogsDisplay />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
