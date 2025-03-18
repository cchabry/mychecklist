
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, InfoIcon, CheckCircle } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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
  
  // Charger les valeurs depuis localStorage au démarrage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('notion_api_key') || '';
    const savedDatabaseId = localStorage.getItem('notion_database_id') || '';
    
    if (savedApiKey && !apiKey) {
      setApiKey(savedApiKey);
    }
    
    if (savedDatabaseId && !databaseId) {
      setDatabaseId(savedDatabaseId);
    }
  }, []);
  
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
      
      // Vérifier le format de la clé API - doit commencer par "secret_"
      if (!apiKey.startsWith('secret_')) {
        setError('Format de clé API invalide. La clé d\'intégration doit commencer par "secret_"');
        setLoading(false);
        return;
      }
      
      // Sauvegarder temporairement les valeurs pour que l'utilisateur les voit même avant soumission
      localStorage.setItem('notion_api_key', apiKey);
      localStorage.setItem('notion_database_id', databaseId);
      
      // Toast de confirmation pour montrer que les valeurs sont sauvegardées
      toast.info('Paramètres sauvegardés', {
        description: 'Test de connexion en cours...',
        duration: 3000
      });
      
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
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey">Clé API d'intégration Notion</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>La clé d'intégration commence par <code>secret_</code>, et non par <code>ntn_</code> (qui est un token OAuth)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="secret_xxxxxxxxxxx"
          required
          className={!apiKey.startsWith('secret_') && apiKey.length > 0 ? 'border-red-300' : ''}
        />
        {!apiKey.startsWith('secret_') && apiKey.length > 0 && (
          <p className="text-xs text-red-500">
            ⚠️ La clé doit commencer par "secret_" et non "ntn_"
          </p>
        )}
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
      
      {/* État de la configuration actuelle */}
      {(localStorage.getItem('notion_api_key') || localStorage.getItem('notion_database_id')) && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Configuration actuelle</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>Clé API: {localStorage.getItem('notion_api_key') ? '✓ Définie' : '❌ Non définie'}</li>
                <li>Base de données: {localStorage.getItem('notion_database_id') ? '✓ Définie' : '❌ Non définie'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
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
