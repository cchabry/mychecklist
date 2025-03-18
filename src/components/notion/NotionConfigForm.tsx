import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, InfoIcon, CheckCircle, XCircle } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { isOAuthToken, isIntegrationKey } from '@/lib/notionProxy/config';

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
  
  // Quand les props initialApiKey ou initialDatabaseId changent, mettre à jour les états
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem('notion_api_key') || '';
      const savedDatabaseId = localStorage.getItem('notion_database_id') || '';
      
      setApiKey(savedApiKey);
      setDatabaseId(savedDatabaseId);
      
      // Log pour debug
      console.log('Modal ouverte, chargement des valeurs:', {
        apiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : 'vide',
        databaseId: savedDatabaseId || 'vide'
      });

      // Réinitialiser les erreurs à chaque ouverture
      setError('');
      setShowErrorDetails(false);
    }
  }, [initialApiKey, initialDatabaseId]);
  
  // Validation de la clé API Notion
  const getApiKeyStatus = (): { valid: boolean; message: string } => {
    if (!apiKey) {
      return { valid: false, message: '' };
    }
    
    // Accepter à la fois les tokens OAuth (ntn_) et les clés d'intégration (secret_)
    if (isOAuthToken(apiKey)) {
      return { 
        valid: true, 
        message: "✓ Format OAuth détecté (commence par 'ntn_')" 
      };
    }
    
    // Valider le format des clés d'intégration
    if (isIntegrationKey(apiKey)) {
      return { 
        valid: true, 
        message: "✓ Format clé d'intégration correct (commence par 'secret_')" 
      };
    }
    
    // Format invalide
    return { 
      valid: false, 
      message: "⚠️ Format incorrect - la clé doit commencer par 'secret_' ou 'ntn_'" 
    };
  };
  
  const apiKeyStatus = getApiKeyStatus();
  
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
      
      // Vérifier le format de la clé API - accepter les deux formats
      if (!apiKeyStatus.valid) {
        setError('Format de clé API invalide. La clé doit commencer par "secret_" (intégration) ou "ntn_" (OAuth)');
        setLoading(false);
        return;
      }
      
      // Afficher la confirmation de soumission
      toast.info('Paramètres enregistrés', {
        description: 'Test de connexion en cours...',
        duration: 3000
      });
      
      console.log('Soumission des valeurs:', {
        apiKey: `${apiKey.substring(0, 8)}...`,
        databaseId: databaseId,
        apiKeyType: isOAuthToken(apiKey) ? 'OAuth (ntn_)' : 'Integration (secret_)'
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
          <Label htmlFor="apiKey">Clé API Notion</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Clé d'intégration (commence par <code>secret_</code>) ou token OAuth (commence par <code>ntn_</code>)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="secret_xxx ou ntn_xxx"
          required
          className={!apiKeyStatus.valid && apiKey.length > 0 ? 'border-red-300' : ''}
        />
        {apiKey.length > 0 && (
          <div className={`text-xs ${apiKeyStatus.valid ? 'text-green-600' : 'text-red-500'} flex items-center gap-1`}>
            {apiKeyStatus.valid ? 
              <CheckCircle size={14} /> : 
              <AlertCircle size={14} />
            }
            {apiKeyStatus.message}
          </div>
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
                <li>Clé API: {localStorage.getItem('notion_api_key') ? 
                  `✓ Définie (${localStorage.getItem('notion_api_key')?.substring(0, 8)}...)` : 
                  '❌ Non définie'}</li>
                <li>Base de données: {localStorage.getItem('notion_database_id') ? 
                  `✓ Définie (${localStorage.getItem('notion_database_id')})` : 
                  '❌ Non définie'}</li>
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
          disabled={loading || (apiKey.length > 0 && !apiKeyStatus.valid)}
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
