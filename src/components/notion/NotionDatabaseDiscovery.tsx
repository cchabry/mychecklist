
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { useNotion } from '@/contexts/NotionContext';
import { toast } from 'sonner';

interface DatabaseInfo {
  id: string;
  title: string;
  description?: string;
  properties: Record<string, any>;
}

const NotionDatabaseDiscovery: React.FC = () => {
  const { config, status } = useNotion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  
  const discoverDatabases = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier que l'API est configurée
      if (!config.apiKey) {
        throw new Error('Clé API Notion non configurée');
      }
      
      // Tenter de récupérer toutes les bases de données
      const response = await notionApi.databases.list(config.apiKey);
      
      if (!response.results || !Array.isArray(response.results)) {
        throw new Error('Format de réponse Notion invalide');
      }
      
      // Mapper les résultats
      const dbList: DatabaseInfo[] = response.results.map((db: any) => {
        // Extraire le titre
        const titleContent = db.title?.[0]?.plain_text || 'Sans titre';
        
        return {
          id: db.id,
          title: titleContent,
          description: db.description?.[0]?.plain_text,
          properties: db.properties || {}
        };
      });
      
      setDatabases(dbList);
      toast.success(`${dbList.length} bases de données trouvées`);
    } catch (err) {
      console.error('Erreur lors de la découverte des bases de données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Échec de la découverte des bases de données');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyDatabaseId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID copié dans le presse-papier');
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Découverte des bases de données Notion
        </CardTitle>
        <CardDescription>
          Cette fonctionnalité permet de lister toutes les bases de données accessibles avec votre clé API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!status.isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Non connecté à Notion</AlertTitle>
            <AlertDescription>
              La connexion à Notion n'est pas établie. Veuillez configurer votre API Notion avant d'utiliser cette fonctionnalité.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {databases.length > 0 ? (
            <div className="grid gap-3">
              {databases.map((db) => (
                <Card key={db.id} className="overflow-hidden">
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium truncate">{db.title}</h3>
                      {db.description && (
                        <p className="text-sm text-muted-foreground mt-1">{db.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {Object.keys(db.properties).length} propriétés
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyDatabaseId(db.id)}
                      className="shrink-0"
                    >
                      Copier ID
                    </Button>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 text-xs font-mono text-slate-500 overflow-hidden text-ellipsis">
                    {db.id}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {!isLoading && (
                <>
                  <Database className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>Aucune base de données découverte</p>
                  <p className="text-sm mt-1">Cliquez sur le bouton ci-dessous pour rechercher vos bases de données</p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          onClick={discoverDatabases}
          disabled={isLoading || !status.isConnected}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Découvrir les bases de données
            </>
          )}
        </Button>
        
        {databases.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setDatabases([])}
          >
            Effacer les résultats
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NotionDatabaseDiscovery;
