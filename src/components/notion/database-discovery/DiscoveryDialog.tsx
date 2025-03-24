
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Database, Loader2 } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import DatabaseListItem from './DatabaseListItem';
import DatabaseSearchHeader from './DatabaseSearchHeader';
import DatabaseEmptyState from './DatabaseEmptyState';

interface DiscoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
  onSelectDatabase?: (id: string, target: 'projects' | 'checklists') => void;
}

interface DatabaseItem {
  id: string;
  title: string;
  createdTime: string;
}

const DiscoveryDialog: React.FC<DiscoveryDialogProps> = ({ 
  open, 
  onOpenChange,
  apiKey = '',
  onSelectDatabase
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const handleDiscoverDatabases = async () => {
    if (!apiKey) {
      setError("Clé API Notion manquante");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser directement la fonction list de l'endpoint databases qui a été corrigée
      const response = await notionApi.databases.list(apiKey);
      
      // Formater les résultats
      const databasesList = response.results.map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Sans titre',
        createdTime: new Date(db.created_time).toLocaleString()
      }));
      
      setDatabases(databasesList);
      
      if (databasesList.length === 0) {
        setError("Aucune base de données trouvée");
      }
    } catch (err) {
      console.error('Erreur lors de la découverte des bases de données:', err);
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des bases de données");
      
      // Si l'erreur est liée à l'authentification, afficher un message spécifique
      if (err instanceof Error && err.message.includes('401')) {
        setError("Erreur d'authentification. Vérifiez votre clé API Notion.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrer les bases de données en fonction de la recherche
  const filteredDatabases = databases.filter(db => 
    db.title.toLowerCase().includes(search.toLowerCase()) || 
    db.id.includes(search)
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Découverte des bases de données Notion
          </DialogTitle>
          <DialogDescription>
            Récupérez la liste des bases de données accessibles avec votre clé API
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {!databases.length && !isLoading && (
            <Button 
              onClick={handleDiscoverDatabases} 
              disabled={isLoading || !apiKey}
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
          )}
          
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {databases.length > 0 && (
            <>
              <DatabaseSearchHeader 
                search={search}
                onSearchChange={setSearch}
                onRefresh={handleDiscoverDatabases}
              />
              
              <div className="max-h-72 overflow-y-auto space-y-2">
                {filteredDatabases.map((db) => (
                  <DatabaseListItem 
                    key={db.id}
                    id={db.id}
                    title={db.title}
                    createdTime={db.createdTime}
                    onSelectDatabase={onSelectDatabase}
                  />
                ))}
                
                {filteredDatabases.length === 0 && (
                  <DatabaseEmptyState searchTerm={search} />
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoveryDialog;
