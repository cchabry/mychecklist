
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, AlertCircle, Database, Copy, RefreshCw } from 'lucide-react';
import { notionDiagnostic } from '@/lib/notion/diagnosticHelper';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotionDiagnosticReportProps {
  buttonLabel?: string;
  buttonClassName?: string;
  onDiagnosticComplete?: (success: boolean) => void;
}

const NotionDiagnosticReport: React.FC<NotionDiagnosticReportProps> = ({ 
  buttonLabel = "Diagnostic Notion", 
  buttonClassName = "",
  onDiagnosticComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const runDiagnostic = async () => {
    setIsRunning(true);
    
    try {
      const diagnosticResult = await notionDiagnostic.runFullDiagnostic();
      setResult(diagnosticResult);
      
      if (onDiagnosticComplete) {
        onDiagnosticComplete(diagnosticResult.success);
      }
    } catch (error) {
      toast.error('Erreur du diagnostic', {
        description: error.message || 'Une erreur est survenue'
      });
      setResult({
        success: false,
        message: 'Erreur lors du diagnostic',
        details: { error: error.message }
      });
      
      if (onDiagnosticComplete) {
        onDiagnosticComplete(false);
      }
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !result) {
      runDiagnostic();
    }
  };
  
  const handleCopyDetails = () => {
    if (!result) return;
    
    try {
      const text = JSON.stringify(result.details, null, 2);
      navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papier');
    } catch (error) {
      toast.error('Erreur de copie', {
        description: error.message
      });
    }
  };
  
  const handleFixIssues = async () => {
    setIsRunning(true);
    
    try {
      const success = await notionDiagnostic.fixNotionIssues();
      
      if (success) {
        runDiagnostic(); // Relancer le diagnostic pour confirmer la résolution
      }
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${buttonClassName}`}
        >
          <Activity size={16} />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diagnostic Notion
          </DialogTitle>
        </DialogHeader>
        
        {isRunning ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Diagnostic en cours...</p>
          </div>
        ) : result ? (
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Résumé</TabsTrigger>
              <TabsTrigger value="details">Détails techniques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                      État global
                    </CardTitle>
                    <Badge 
                      variant={result.success ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {result.success ? "OK" : "Problèmes détectés"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {result.message}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {result.details && (
                    <div className="space-y-4">
                      {/* Utilisateur */}
                      {result.details.user && (
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Authentification</p>
                            <p className="text-sm text-muted-foreground">
                              Connecté en tant que {result.details.user}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Base de projets */}
                      {result.details.databases?.projects && (
                        <div className="flex items-start space-x-3">
                          {result.details.databases.projects.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">Base de projets</p>
                            {result.details.databases.projects.success ? (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Base "{result.details.databases.projects.name}" accessible
                                </p>
                                {result.details.databases.projects.error && (
                                  <p className="text-sm text-amber-600 mt-1">
                                    {result.details.databases.projects.error}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-red-500">
                                {result.details.databases.projects.error}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Base de checklists */}
                      {result.details.databases?.checklists && (
                        <div className="flex items-start space-x-3">
                          {result.details.databases.checklists.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <p className="font-medium">Base de checklists</p>
                            {result.details.databases.checklists.success ? (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Base "{result.details.databases.checklists.name}" accessible
                                </p>
                                {result.details.databases.checklists.error && (
                                  <p className="text-sm text-amber-600 mt-1">
                                    {result.details.databases.checklists.error}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-amber-500">
                                {result.details.databases.checklists.error || "Base non configurée ou inaccessible"}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Projets */}
                      {result.details.projects && (
                        <div className="flex items-start space-x-3">
                          {!result.details.projects.error ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">Récupération des projets</p>
                            {!result.details.projects.error ? (
                              <p className="text-sm text-muted-foreground">
                                {result.details.projects.count} projets trouvés
                              </p>
                            ) : (
                              <p className="text-sm text-red-500">
                                {result.details.projects.error}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Erreur générale */}
                      {result.details.error && (
                        <div className="flex items-center space-x-3">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">Erreur</p>
                            <p className="text-sm text-red-500">
                              {result.details.error}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" onClick={runDiagnostic} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                  </Button>
                  {!result.success && (
                    <Button onClick={handleFixIssues} className="gap-2">
                      <Database className="h-4 w-4" />
                      Tenter réparation
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Détails techniques</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleCopyDetails}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Informations détaillées sur la connexion à Notion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun diagnostic disponible</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionDiagnosticReport;
