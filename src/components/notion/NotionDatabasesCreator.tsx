
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotionError } from '@/services/notion/errorHandling/types';
import { useNotionAPI } from '@/hooks/notion/useNotionAPI';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const NotionDatabasesCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: NotionError;
    dbId?: string;
  } | null>(null);
  
  const notionAPI = useNotionAPI();

  const handleCreateDatabase = async () => {
    setIsCreating(true);
    setResult(null);
    
    try {
      const response = await notionAPI.execute('/v1/databases', 'POST', {
        parent: { type: 'page_id', page_id: 'your-page-id-here' },
        title: [{ type: 'text', text: { content: 'Projets Audit' } }],
        properties: {
          Name: { title: {} },
          Status: {
            select: {
              options: [
                { name: 'En cours', color: 'blue' },
                { name: 'Terminé', color: 'green' },
                { name: 'En attente', color: 'yellow' }
              ]
            }
          },
          URL: { url: {} },
          Date: { date: {} }
        }
      });
      
      setResult({
        success: true,
        message: 'Base de données créée avec succès',
        dbId: response.id
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de la création de la base de données',
        error: error as NotionError
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer une base de données Notion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            Cette fonctionnalité vous permet de créer automatiquement une base de données
            pour les projets d'audit dans votre espace Notion.
          </p>
          
          <Button 
            onClick={handleCreateDatabase} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer la base de données'
            )}
          </Button>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertTitle>{result.success ? 'Succès' : 'Erreur'}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.dbId && (
                  <div className="mt-2">
                    ID de la base de données: <code>{result.dbId}</code>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionDatabasesCreator;
