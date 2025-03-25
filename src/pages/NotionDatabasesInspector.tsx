
import React from 'react';
import { useNotionRequest } from '@/hooks/useNotionRequest';
import DatabaseStructureValidator from '@/components/notion/DatabaseStructureValidator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const NotionDatabasesInspector: React.FC = () => {
  const { isAuthenticated } = useNotionRequest();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Inspection des bases de données Notion</h1>
      
      {!isAuthenticated ? (
        <Card className="mb-6">
          <CardContent className="py-6">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Configuration requise</AlertTitle>
              <AlertDescription>
                Vous devez configurer la connexion à Notion avant de pouvoir inspecter les bases de données.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>À propos de l'inspection</CardTitle>
              <CardDescription>
                Cet outil vérifie que vos bases de données Notion sont correctement configurées selon les exigences de l'application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Comment utiliser cet outil</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Cliquez sur "Vérifier les structures" pour analyser toutes les bases de données configurées dans l'application.
                  </p>
                  <p>
                    Les résultats vous indiqueront si vos bases de données sont correctement configurées ou si des corrections sont nécessaires.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <DatabaseStructureValidator />
        </>
      )}
    </div>
  );
};

export default NotionDatabasesInspector;
