import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotionErrorsList } from '@/components/notion/error';
import { 
  notionErrorService, 
  NotionErrorType, 
  NotionErrorSeverity
} from '@/services/notion/errorHandling';
import { AlertTriangle, Database, RefreshCw, Router } from 'lucide-react';
import { useNotionErrorService } from '@/services/notion/errorHandling';

const DiagnosticsErrorPage: React.FC = () => {
  const { reportError } = useNotionErrorService();
  const [lastAction, setLastAction] = useState<string>('');
  
  // Générer une erreur réseau
  const generateNetworkError = () => {
    const error = new Error('La connexion au serveur Notion a échoué');
    notionErrorService.reportError(error, 'GET /v1/databases');
    setLastAction('Erreur réseau générée');
  };
  
  // Générer une erreur d'authentification
  const generateAuthError = () => {
    const error = notionErrorService.createError('Token d\'API invalide ou expiré', {
      type: NotionErrorType.AUTH,
      severity: NotionErrorSeverity.ERROR,
      context: { 
        httpCode: 401,
        apiVersion: '2022-02-22'
      }
    });
    notionErrorService.reportError(error);
    setLastAction('Erreur d\'authentification générée');
  };
  
  // Générer une erreur de limite de taux
  const generateRateLimitError = () => {
    const error = notionErrorService.createError('Limite de requêtes API dépassée', {
      type: NotionErrorType.RATE_LIMIT,
      severity: NotionErrorSeverity.WARNING,
      context: { 
        httpCode: 429,
        retryAfter: 30,
        limit: '3 requêtes par seconde'
      }
    });
    notionErrorService.reportError(error);
    setLastAction('Erreur de limite de taux générée');
  };
  
  // Générer une erreur de base de données
  const generateDatabaseError = () => {
    const error = notionErrorService.createError('Base de données introuvable', {
      type: NotionErrorType.DATABASE,
      severity: NotionErrorSeverity.ERROR,
      context: { 
        databaseId: '12345678-1234-5678-1234-567812345678',
        httpCode: 404
      }
    });
    notionErrorService.reportError(error);
    setLastAction('Erreur de base de données générée');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Diagnostics d'erreurs Notion</h1>
        <p className="text-muted-foreground">
          Cette page permet de tester le système de gestion d'erreurs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <NotionErrorsList 
            title="Historique des erreurs" 
            onRetryAll={() => setLastAction('Action: Réessayer tout')}
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Générateur d'erreurs</CardTitle>
              <CardDescription>
                Créez différents types d'erreurs pour tester le système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={generateNetworkError}
              >
                <Router className="mr-2 h-4 w-4 text-red-500" />
                Erreur réseau
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={generateAuthError}
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                Erreur d'authentification
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={generateRateLimitError}
              >
                <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                Erreur de limite d'API
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={generateDatabaseError}
              >
                <Database className="mr-2 h-4 w-4 text-purple-500" />
                Erreur de base de données
              </Button>
            </CardContent>
          </Card>
          
          {lastAction && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Dernière action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{lastAction}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsErrorPage;
