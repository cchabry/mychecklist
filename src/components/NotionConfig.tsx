
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { configureNotion, isNotionConfigured, extractNotionDatabaseId } from '@/lib/notion';
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
  const [error, setError] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!apiKey || !databaseId) {
        setError('La clé API et l\'ID de base de données sont requis');
        setLoading(false);
        return;
      }
      
      // Nettoyer l'ID de la base de données
      const cleanDbId = extractNotionDatabaseId(databaseId);
      console.log('Using database ID:', cleanDbId, '(original:', databaseId, ')');
      
      // Tester la connexion à l'API Notion
      try {
        console.log('Testing connection to Notion API with key:', apiKey.substring(0, 5) + '...');
        const user = await notionApi.users.me(apiKey);
        console.log('Notion API connection successful, user:', user.name);
        
        // Tester l'accès à la base de données
        try {
          console.log('Testing database access for ID:', cleanDbId);
          await notionApi.databases.retrieve(cleanDbId, apiKey);
          console.log('Database access successful');
        } catch (dbError) {
          console.error('Database access failed:', dbError);
          setError('Erreur d\'accès à la base de données: ' + (dbError.message || 'Vérifiez l\'ID et les permissions'));
          setLoading(false);
          return;
        }
        
        // Si tous les tests réussissent, configurer Notion
        const success = configureNotion(apiKey, cleanDbId);
        
        if (success) {
          toast.success('Configuration Notion réussie', {
            description: 'L\'intégration avec Notion est maintenant active'
          });
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setError('Erreur lors de la configuration');
        }
      } catch (connectionError) {
        console.error('Connection test failed:', connectionError);
        setError('Échec de la connexion à Notion: ' + (connectionError.message || 'Vérifiez votre clé API'));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      setError('Une erreur est survenue: ' + (error.message || 'Erreur inconnue'));
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
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          
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
