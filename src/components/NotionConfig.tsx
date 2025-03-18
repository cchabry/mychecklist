
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { configureNotion, isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

interface NotionConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NotionConfig: React.FC<NotionConfigProps> = ({ isOpen, onClose, onSuccess }) => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('notion_api_key') || '');
  const [databaseId, setDatabaseId] = useState<string>(localStorage.getItem('notion_database_id') || '');
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!apiKey || !databaseId) {
        toast.error('Configuration invalide', {
          description: 'La clé API et l\'ID de base de données sont requis'
        });
        setLoading(false);
        return;
      }
      
      // Ensure proper format for database ID (remove any prefixes if present)
      const formattedDbId = databaseId.includes('/') 
        ? databaseId.split('/').pop() 
        : databaseId;
      
      console.log('Testing Notion connection with API key');
      
      // Test connection using the new proxy API
      try {
        const user = await notionApi.users.me(apiKey);
        console.log('Notion API connection successful, user:', user.name);
        
        // Test database access
        if (formattedDbId) {
          try {
            await notionApi.databases.query(formattedDbId, { page_size: 1 }, apiKey);
            console.log('Database access successful');
          } catch (dbError) {
            console.error('Database access failed:', dbError);
            toast.error('Erreur d\'accès à la base de données', {
              description: 'Vérifiez l\'ID de base de données et les permissions de l\'intégration'
            });
            setLoading(false);
            return;
          }
        }
        
        // If all tests pass, configure Notion
        const success = configureNotion(apiKey, formattedDbId || databaseId);
        
        if (success) {
          toast.success('Configuration Notion réussie', {
            description: 'L\'intégration avec Notion est maintenant active'
          });
          if (onSuccess) onSuccess();
          onClose();
        }
      } catch (connectionError) {
        console.error('Connection test failed:', connectionError);
        toast.error('Échec de la connexion à Notion', {
          description: 'Vérifiez votre clé API et votre connexion internet'
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue pendant la configuration'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configuration Notion</DialogTitle>
          <DialogDescription>
            Connectez votre base de données Notion pour synchroniser vos audits
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Clé API d'intégration Notion</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_xxxxxxxxxxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Créez une intégration sur <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-tmw-teal underline">notion.so/my-integrations</a>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="databaseId">ID de la base de données</Label>
            <Input
              id="databaseId"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Trouvez l'ID dans l'URL de votre base de données Notion
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-tmw-teal hover:bg-tmw-teal/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Test en cours...
                </>
              ) : "Connecter Notion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotionConfig;
