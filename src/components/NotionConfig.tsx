
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { configureNotion, isNotionConfigured } from '@/lib/notionService';
import { toast } from 'sonner';

interface NotionConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NotionConfig: React.FC<NotionConfigProps> = ({ isOpen, onClose, onSuccess }) => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('NOTION_API_KEY') || '');
  const [databaseId, setDatabaseId] = useState<string>(localStorage.getItem('NOTION_DATABASE_ID') || '');
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
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
      
      const success = configureNotion(apiKey, databaseId);
      
      if (success) {
        toast.success('Configuration Notion réussie', {
          description: 'L\'intégration avec Notion est maintenant active'
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Erreur de configuration', {
          description: 'Impossible de configurer l\'intégration Notion'
        });
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Une erreur est survenue pendant la configuration'
      });
      console.error(error);
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
              {loading ? "Configuration..." : "Connecter Notion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotionConfig;
