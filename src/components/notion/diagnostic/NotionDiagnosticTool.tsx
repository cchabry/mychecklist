
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Database, RefreshCw, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import NotionDiagnosticRunner, { DiagnosticResults } from './NotionDiagnosticRunner';
import NotionTestSection from './NotionTestSection';
import NotionTestSummary from './NotionTestSummary';
import NotionCreatePageTest from '../NotionCreatePageTest';

interface NotionDiagnosticToolProps {
  onConfigClick?: () => void;
}

const NotionDiagnosticTool: React.FC<NotionDiagnosticToolProps> = ({ onConfigClick }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [persistCreatedPage, setPersistCreatedPage] = useState(false);
  const [createdPageInfo, setCreatedPageInfo] = useState<{id: string; title: string} | null>(null);
  const [results, setResults] = useState<DiagnosticResults>({
    configTests: [],
    connectivityTests: [],
    permissionTests: [],
    structureTests: []
  });
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  
  const handleTestsComplete = (newResults: DiagnosticResults) => {
    setResults(newResults);
    setIsRunning(false);
    setLastRunTime(new Date().toLocaleTimeString());
  };
  
  const runDiagnostics = () => {
    setIsRunning(true);
    setCreatedPageInfo(null);
    // NotionDiagnosticRunner va s'occuper d'exécuter les tests
  };
  
  useEffect(() => {
    // Exécuter les tests au chargement
    runDiagnostics();
  }, []);
  
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
          
          {!isRunning && results.configTests.length > 0 && (
            <div className="mt-4">
              <NotionTestSummary 
                tests={[results.configTests, results.connectivityTests, results.permissionTests, results.structureTests]} 
              />
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
          ) : (
            <div className="space-y-6">
              <NotionTestSection title="Configuration" tests={results.configTests} />
              
              <Separator />
              
              <NotionTestSection title="Connectivité" tests={results.connectivityTests} />
              
              <Separator />
              
              <NotionTestSection title="Permissions" tests={results.permissionTests} />
              
              <Separator />
              
              <NotionTestSection title="Structure" tests={results.structureTests} />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-6 pb-4 flex justify-between">
          <div className="text-xs text-muted-foreground">
            {isRunning ? 'Diagnostics en cours...' : `Dernière exécution: ${lastRunTime || 'jamais'}`}
          </div>
          
          {onConfigClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onConfigClick}
              className="text-xs"
            >
              Modifier la configuration
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {isRunning && (
        <NotionDiagnosticRunner 
          onComplete={handleTestsComplete}
          persistCreatedPage={persistCreatedPage}
        />
      )}
    </div>
  );
};

export default NotionDiagnosticTool;
