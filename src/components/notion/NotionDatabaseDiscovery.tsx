
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { Loader, Database, ExternalLink, CheckCircle, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Type définissant les cibles possibles pour les bases de données Notion
export type NotionDatabaseTarget = 
  | 'projects' 
  | 'checklists' 
  | 'exigences' 
  | 'pages' 
  | 'audits' 
  | 'evaluations' 
  | 'actions' 
  | 'progress';

interface NotionDatabase {
  id: string;
  title: string;
  lastEditedTime: string;
  url: string;
}

interface NotionDatabaseDiscoveryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onSelectDatabase: (id: string, target: NotionDatabaseTarget) => void;
  autoClose?: boolean;
}

/**
 * Composant d'interface pour découvrir et sélectionner des bases de données Notion
 */
const NotionDatabaseDiscovery: React.FC<NotionDatabaseDiscoveryProps> = ({
  open,
  onOpenChange,
  apiKey,
  onSelectDatabase,
  autoClose = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<NotionDatabaseTarget>('projects');

  // Exécuter la recherche des bases de données lorsque le dialogue s'ouvre
  useEffect(() => {
    if (open && apiKey) {
      searchDatabases();
    }
  }, [open, apiKey]);

  const searchDatabases = async () => {
    if (!apiKey) {
      toast.error("Clé API requise", {
        description: "Veuillez entrer une clé API Notion valide."
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Forcer temporairement le mode réel pour cette requête
      const wasMockMode = notionApi.mockMode.isActive();
      if (wasMockMode) {
        notionApi.mockMode.temporarilyForceReal();
      }

      // Récupérer la liste des bases de données disponibles
      const response = await notionApi.databases.list(apiKey);

      // Formater les résultats
      const formattedDatabases = response.results.map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Base sans titre',
        lastEditedTime: db.last_edited_time,
        url: db.url
      }));

      setDatabases(formattedDatabases);

      if (formattedDatabases.length === 0) {
        setError("Aucune base de données trouvée. Vérifiez que votre intégration Notion a accès à des bases de données.");
      }
    } catch (error) {
      console.error('Erreur lors de la recherche des bases de données:', error);
      
      setError(`Erreur: ${error instanceof Error ? error.message : 'Impossible de récupérer les bases de données Notion'}`);
      
      toast.error('Erreur de recherche', {
        description: error instanceof Error ? error.message : 'Impossible de récupérer les bases de données'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDatabase = (database: NotionDatabase) => {
    onSelectDatabase(database.id, selectedTarget);
    
    if (autoClose) {
      onOpenChange(false);
    }
  };

  // Filtrer les bases de données selon la recherche
  const filteredDatabases = searchQuery 
    ? databases.filter(db => 
        db.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        db.id.includes(searchQuery)
      )
    : databases;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Découverte des bases de données Notion
          </DialogTitle>
          <DialogDescription>
            Sélectionnez la base de données Notion pour chaque type de contenu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs defaultValue="projects" value={selectedTarget} onValueChange={(v) => setSelectedTarget(v as NotionDatabaseTarget)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="audits">Audits</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 my-2">
              <Input 
                placeholder="Rechercher une base de données..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={searchDatabases}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {error && (
              <div className="text-sm text-red-500 my-2">
                {error}
              </div>
            )}
            
            <div className="h-[300px] overflow-y-auto border rounded-md p-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDatabases.length > 0 ? (
                <ul className="space-y-2">
                  {filteredDatabases.map((db) => (
                    <li 
                      key={db.id} 
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleSelectDatabase(db)}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{db.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">{db.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={db.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDatabase(db);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Sélectionner
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {!error && "Aucune base de données trouvée pour votre recherche."}
                </div>
              )}
            </div>
          </Tabs>
          
          <div className="flex justify-between">
            <Badge variant="outline" className="text-xs">
              Base sélectionnée pour: {selectedTarget}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotionDatabaseDiscovery;
