
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { configureNotion, extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import NotionErrorDetails from './NotionErrorDetails';
import NotionConfigForm from './NotionConfigForm';

interface NotionConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NotionConfig: React.FC<NotionConfigProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorContext, setErrorContext] = useState<string>('');
  const [initialApiKey, setInitialApiKey] = useState<string>('');
  const [initialDatabaseId, setInitialDatabaseId] = useState<string>('');
  
  // Charger les valeurs initiales depuis localStorage à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setInitialApiKey(localStorage.getItem('notion_api_key') || '');
      setInitialDatabaseId(localStorage.getItem('notion_database_id') || '');
    }
  }, [isOpen]);
  
  const handleFormSubmit = async (apiKey: string, databaseId: string) => {
    setError('');
    setErrorContext('');
    
    // Nettoyer l'ID de la base de données
    const cleanDbId = extractNotionDatabaseId(databaseId);
    console.log('Using database ID:', cleanDbId, '(original:', databaseId, ')');
    
    // Tester la connexion à l'API Notion via notre proxy
    try {
      console.log('Testing connection to Notion API with key:', apiKey.substring(0, 9) + '...');
      
      // Configurer Notion d'abord pour définir les valeurs dans localStorage
      configureNotion(apiKey, cleanDbId);
      
      // Tester la connexion via le proxy
      const user = await notionApi.users.me(apiKey);
      console.log('Notion API connection successful via proxy, user:', user.name);
      
      // Tester l'accès à la base de données
      try {
        console.log('Testing database access for ID:', cleanDbId);
        await notionApi.databases.retrieve(cleanDbId, apiKey);
        console.log('Database access successful via proxy');
      } catch (dbError) {
        console.error('Database access failed:', dbError);
        setError('Erreur d\'accès à la base de données: ' + (dbError.message || 'Vérifiez l\'ID et les permissions'));
        setErrorContext('Test de connexion à la base de données');
        throw dbError;
      }
      
      // Si tous les tests réussissent
      toast.success('Configuration Notion réussie', {
        description: 'L\'intégration avec Notion est maintenant active'
      });
      
      // Désactiver le mode mock si c'était activé
      if (notionApi.mockMode.isActive()) {
        notionApi.mockMode.deactivate();
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (connectionError) {
      console.error('Connection test failed:', connectionError);
      
      // Traitement spécifique pour "Failed to fetch"
      if (connectionError.message?.includes('Failed to fetch')) {
        setError('Échec de la connexion à Notion: ' + connectionError.message);
        setErrorContext('Problème de connexion au proxy - Vérifiez que le proxy Vercel est correctement déployé');
        
        // Activer le mode mock
        notionApi.mockMode.activate();
        toast.warning('Mode démonstration activé', {
          description: 'Impossible de se connecter à l\'API Notion. L\'application utilisera des données de test.'
        });
        
        // Considérer comme un succès (avec mock data)
        if (onSuccess) onSuccess();
        
        // Montrer la popup de détails d'erreur
        setShowErrorDetails(true);
      } else {
        setError('Échec de la connexion à Notion: ' + (connectionError.message || 'Vérifiez votre clé API'));
        setErrorContext('Test de connexion à l\'API Notion');
      }
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Configuration Notion</DialogTitle>
            <DialogDescription>
              Connectez votre base de données Notion pour synchroniser vos audits
            </DialogDescription>
          </DialogHeader>
          
          <NotionConfigForm 
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            initialApiKey={initialApiKey}
            initialDatabaseId={initialDatabaseId}
          />
        </DialogContent>
      </Dialog>
      
      <NotionErrorDetails
        isOpen={showErrorDetails}
        onClose={() => setShowErrorDetails(false)}
        error={error}
        context={errorContext}
      />
    </>
  );
};

export default NotionConfig;
