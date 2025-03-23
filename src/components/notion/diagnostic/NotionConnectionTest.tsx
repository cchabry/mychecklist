
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { NotionConnectionTestProps } from './types';
import { notionApi } from '@/lib/notionProxy';

const NotionConnectionTest: React.FC<NotionConnectionTestProps> = ({ 
  apiKey, 
  onClose,
  onSuccess,
  onError 
}) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Vérification de la connexion...');
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        if (!apiKey?.trim()) {
          setStatus('error');
          setMessage('Clé API manquante');
          onError && onError(new Error('Clé API manquante'));
          return;
        }

        const user = await notionApi.users.me(apiKey);
        
        if (user && user.id) {
          setStatus('success');
          setMessage(`Connexion réussie. Connecté en tant que ${user.name || user.id}`);
          onSuccess && onSuccess();
        } else {
          setStatus('error');
          setMessage('Erreur de connexion');
          setDetails('La réponse de l\'API Notion est invalide');
          onError && onError(new Error('Réponse invalide'));
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur de connexion');
        setDetails(error instanceof Error ? error.message : 'Erreur inconnue');
        onError && onError(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    testConnection();
  }, [apiKey, onSuccess, onError]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test de connexion à Notion</DialogTitle>
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
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionConnectionTest;
