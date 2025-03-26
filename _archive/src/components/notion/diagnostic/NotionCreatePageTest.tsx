
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotionCreatePageTestProps } from './types';
import { notionApi } from '@/lib/notionProxy';

const NotionCreatePageTest: React.FC<NotionCreatePageTestProps> = ({ 
  databaseId, 
  onClose,
  onSuccess,
  onError 
}) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string | null>(null);
  const [pageName, setPageName] = useState('Test Page');
  const [pageUrl, setPageUrl] = useState('https://example.com');
  const [pageId, setPageId] = useState<string | null>(null);

  const createTestPage = async () => {
    if (!databaseId?.trim()) {
      setStatus('error');
      setMessage('ID de base de données manquant');
      onError && onError(new Error('ID de base de données manquant'));
      return;
    }

    setStatus('pending');
    setMessage('Création de la page de test...');

    try {
      const apiKey = localStorage.getItem('notion_api_key');
      
      if (!apiKey) {
        setStatus('error');
        setMessage('Clé API non configurée');
        onError && onError(new Error('Clé API non configurée'));
        return;
      }

      const response = await notionApi.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: pageName } }] },
          URL: { url: pageUrl }
        }
      }, apiKey);
      
      if (response && response.id) {
        setPageId(response.id);
        setStatus('success');
        setMessage('Page créée avec succès !');
        onSuccess && onSuccess(response.id);
      } else {
        setStatus('error');
        setMessage('Échec de création de la page');
        setDetails('La réponse de l\'API Notion est invalide');
        onError && onError(new Error('Réponse invalide'));
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur lors de la création de la page');
      setDetails(error instanceof Error ? error.message : 'Erreur inconnue');
      onError && onError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une page de test dans Notion</DialogTitle>
        </DialogHeader>
        
        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Nom de la page</Label>
              <Input
                id="pageName"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pageUrl">URL</Label>
              <Input
                id="pageUrl"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
              />
            </div>
          </div>
        )}
        
        {status !== 'idle' && (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            {status === 'pending' && (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
            
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-500" />
            )}
            
            {status === 'error' && (
              <AlertTriangle className="w-12 h-12 text-destructive" />
            )}
            
            <p className="text-center text-lg font-medium">{message}</p>
            
            {details && (
              <p className="text-center text-sm text-muted-foreground">{details}</p>
            )}
            
            {pageId && (
              <div className="w-full mt-4 p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Page ID:</p>
                <code className="text-xs">{pageId}</code>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {status === 'idle' && (
            <Button onClick={createTestPage}>Créer la page</Button>
          )}
          <Button variant={status === 'idle' ? 'outline' : 'default'} onClick={onClose}>
            {status === 'idle' ? 'Annuler' : 'Fermer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionCreatePageTest;
