
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

interface NotionConfigFormProps {
  onSubmit: (apiKey: string, databaseId: string) => Promise<void>;
  onCancel: () => void;
  initialApiKey?: string;
  initialDatabaseId?: string;
}

const NotionConfigForm: React.FC<NotionConfigFormProps> = ({
  onSubmit,
  onCancel,
  initialApiKey = '',
  initialDatabaseId = ''
}) => {
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [databaseId, setDatabaseId] = useState<string>(initialDatabaseId);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);
  
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
      
      await onSubmit(apiKey, databaseId);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
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
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('Failed to fetch') && (
                <p className="text-xs mt-1">
                  Note: Les navigateurs empêchent l'accès direct à l'API Notion. 
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs underline text-red-700" 
                    onClick={() => setShowErrorDetails(true)}
                  >
                    Voir plus de détails
                  </Button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <DialogFooter className="mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
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
  );
};

export default NotionConfigForm;
