
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { NotionDatabaseTestProps } from './types';
import { notionApi } from '@/lib/notionProxy';

const NotionDatabaseTest: React.FC<NotionDatabaseTestProps> = ({ 
  apiKey, 
  databaseId,
  onClose,
  onSuccess,
  onError 
}) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Vérification de la base de données...');
  const [details, setDetails] = useState<string | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        if (!apiKey?.trim()) {
          setStatus('error');
          setMessage('Clé API manquante');
          onError && onError(new Error('Clé API manquante'));
          return;
        }

        if (!databaseId?.trim()) {
          setStatus('error');
          setMessage('ID de base de données manquant');
          onError && onError(new Error('ID de base de données manquant'));
          return;
        }

        const database = await notionApi.databases.retrieve(databaseId, apiKey);
        
        if (database && database.id) {
          setDatabaseInfo(database);
          setStatus('success');
          setMessage(`Base de données trouvée: ${database.title?.[0]?.plain_text || databaseId}`);
          onSuccess && onSuccess(database);
        } else {
          setStatus('error');
          setMessage('Base de données non trouvée');
          setDetails('La réponse de l\'API Notion est invalide');
          onError && onError(new Error('Réponse invalide'));
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur d\'accès à la base de données');
        setDetails(error instanceof Error ? error.message : 'Erreur inconnue');
        onError && onError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    testDatabase();
  }, [apiKey, databaseId, onSuccess, onError]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test de base de données Notion</DialogTitle>
        </DialogHeader>
        
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
          
          {databaseInfo && (
            <div className="w-full mt-4 p-3 bg-muted rounded-md text-sm overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(databaseInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionDatabaseTest;
