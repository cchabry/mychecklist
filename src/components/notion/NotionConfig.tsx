
import React, { useState } from 'react';
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
  
  const handleFormSubmit = async (apiKey: string, databaseId: string) => {
    setError('');
    setErrorContext('');
    
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
        setErrorContext('Test de connexion à la base de données');
        throw dbError;
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
        setErrorContext('Sauvegarde de la configuration');
        throw new Error('Configuration error');
      }
    } catch (connectionError) {
      console.error('Connection test failed:', connectionError);
      
      // Traitement spécifique pour "Failed to fetch"
      if (connectionError.message?.includes('Failed to fetch')) {
        setError('Échec de la connexion à Notion: ' + connectionError.message);
        setErrorContext('Erreur CORS - Les limitations de sécurité du navigateur empêchent la connexion directe à l\'API Notion');
        // Configurer quand même pour permettre la démo avec les données mockées
        configureNotion(apiKey, cleanDbId);
        toast.warning('Mode démonstration activé', {
          description: 'Impossible de se connecter à l\'API Notion. L\'application utilisera des données de test.'
        });
        if (onSuccess) onSuccess();
        
        // Montrer la popup de détails d'erreur
        setShowErrorDetails(true);
      } else {
        setError('Échec de la connexion à Notion: ' + (connectionError.message || 'Vérifiez votre clé API'));
        setErrorContext('Test de connexion à l\'API Notion');
        throw connectionError;
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
            initialApiKey={localStorage.getItem('notion_api_key') || ''}
            initialDatabaseId={localStorage.getItem('notion_database_id') || ''}
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
