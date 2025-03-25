import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useStructuredLogger } from '@/hooks/notion/useStructuredLogger';
import { notionErrorService, LogLevel, NotionErrorType, NotionErrorSeverity } from '@/services/notion/types/unified';
import { StructuredLogsDisplay } from '@/components/notion/logging';
import { NotionErrorMonitor } from '@/components/notion/error';
import { ArrowUpDown, RefreshCw, AlertTriangle, Bug, Database } from 'lucide-react';

const MonitoringDashboard: React.FC = () => {
  const loggerHook = useStructuredLogger();
  const { logs, clearLogs, logger } = loggerHook;
  
  // Adapter l'interface pour les méthodes logger.info et logger.error
  const loggerAdapter = {
    info: (message: string, data?: any) => {
      if (logger && typeof logger.info === 'function') {
        logger.info(message, data);
      }
    },
    error: (message: string, data?: any) => {
      if (logger && typeof logger.error === 'function') {
        logger.error(message, data);
      }
    }
  };
  
  const [lastAction, setLastAction] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('logs');
  
  // Générer des logs de test
  const generateTestLogs = () => {
    if (logger) {
      if (typeof logger.debug === 'function') {
        logger.debug('Test debug message', { source: 'MonitoringDashboard' });
      }
      loggerAdapter.info('Test info message', { component: 'MonitoringDashboard', user: 'Admin' });
      if (typeof logger.warn === 'function') {
        logger.warn('Test warning message', { alertLevel: 'medium' });
      }
      loggerAdapter.error('Test error message', new Error('This is a test error'));
    }
    setLastAction('Logs de test générés');
  };
  
  // Générer une erreur de test
  const generateTestError = () => {
    const error = notionErrorService.createError('Erreur de test pour le monitoring', {
      type: NotionErrorType.UNKNOWN,
      severity: NotionErrorSeverity.WARNING,
      context: JSON.stringify({ 
        testGenerated: true, 
        timestamp: new Date().toISOString() 
      }),
      retryable: true
    });
    
    notionErrorService.reportError(error as Error);
    loggerAdapter.error('Une erreur Notion a été générée', error);
    
    setLastAction('Erreur de test générée');
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord de monitoring</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Erreurs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs structurés</CardTitle>
              <CardDescription>Visualisation des logs applicatifs</CardDescription>
            </CardHeader>
            <CardContent>
              <StructuredLogsDisplay />
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={generateTestLogs}>
              <Bug className="mr-2 h-4 w-4" />
              Générer des logs de test
            </Button>
            
            {lastAction && (
              <Badge variant="secondary">
                Dernière action: {lastAction}
              </Badge>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs Notion</CardTitle>
              <CardDescription>Suivi des erreurs liées à l'API Notion</CardDescription>
            </CardHeader>
            <CardContent>
              <NotionErrorMonitor />
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <Button variant="destructive" size="sm" onClick={generateTestError}>
              <Database className="mr-2 h-4 w-4" />
              Générer une erreur Notion
            </Button>
            
            {lastAction && (
              <Badge variant="secondary">
                Dernière action: {lastAction}
              </Badge>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
