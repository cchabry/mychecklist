
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { configureNotion, extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import NotionErrorDetails from './NotionErrorDetails';
import NotionConfigForm from './NotionConfigForm';
import { isOAuthToken, isIntegrationKey } from '@/lib/notionProxy/config';

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
      const savedApiKey = localStorage.getItem('notion_api_key') || '';
      const savedDatabaseId = localStorage.getItem('notion_database_id') || '';
      
      setInitialApiKey(savedApiKey);
      setInitialDatabaseId(savedDatabaseId);
      
      // Log pour debug
      console.log('Modal ouverte, chargement des valeurs:', {
        apiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : 'vide',
        databaseId: savedDatabaseId || 'vide'
      });

      // Réinitialiser les erreurs à chaque ouverture
      setError('');
      setErrorContext('');
    }
  }, [isOpen]);
  
  const handleFormSubmit = async (apiKey: string, databaseId: string) => {
    setError('');
    setErrorContext('');
    
    // Vérifier que la clé est bien fournie et dans le bon format
    if (!apiKey) {
      setError('La clé API est requise');
      return;
    }
    
    // Accepter à la fois les tokens OAuth (ntn_) et les clés d'intégration (secret_)
    if (!isOAuthToken(apiKey) && !isIntegrationKey(apiKey)) {
      setError('Format de clé API invalide');
      setErrorContext('La clé doit commencer par "secret_" (intégration) ou "ntn_" (OAuth)');
      return;
    }
    
    // Nettoyer l'ID de la base de données
    const cleanDbId = extractNotionDatabaseId(databaseId);
    console.log('Using database ID:', cleanDbId, '(original:', databaseId, ')');
    
    // Sauvegarder les valeurs dans localStorage immédiatement
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', cleanDbId);
    
    console.log('Valeurs sauvegardées dans localStorage:', {
      apiKey: `${apiKey.substring(0, 8)}...`,
      databaseId: cleanDbId,
      tokenType: isOAuthToken(apiKey) ? 'OAuth (ntn_)' : 'Integration (secret_)'
    });
    
    // Commencer par désactiver le mode mock s'il était activé
    if (notionApi.mockMode.isActive()) {
      console.log('Désactivation du mode mock avant test de connexion');
      notionApi.mockMode.deactivate();
    }
    
    // Tester la connexion à l'API Notion via notre proxy
    try {
      console.log('Testing connection to Notion API with key:', apiKey.substring(0, 9) + '...');
      
      // Configurer Notion pour définir les valeurs
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
        
        // Différencier les erreurs d'autorisation des erreurs d'ID invalide
        if (dbError.message?.includes('404') || dbError.message?.includes('not_found')) {
          setError('Base de données introuvable: ' + (dbError.message || 'Vérifiez l\'ID'));
          setErrorContext('L\'ID de base de données fourni n\'existe pas ou n\'est pas accessible');
        } else {
          setError('Erreur d\'accès à la base de données: ' + (dbError.message || 'Vérifiez l\'ID et les permissions'));
          setErrorContext('Vérifiez que votre intégration a été ajoutée à la base de données dans Notion');
        }
        throw dbError;
      }
      
      // Si tous les tests réussissent
      toast.success('Configuration Notion réussie', {
        description: 'L\'intégration avec Notion est maintenant active'
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (connectionError) {
      console.error('Connection test failed:', connectionError);
      
      // Traitement spécifique pour les erreurs d'authentification
      if (connectionError.message?.includes('401') || connectionError.message?.includes('authentication')) {
        setError('Erreur d\'authentification: Clé API invalide');
        setErrorContext('Vérifiez que vous utilisez une clé d\'intégration valide et que votre intégration est correctement configurée');
      }
      // Traitement spécifique pour "Failed to fetch"
      else if (connectionError.message?.includes('Failed to fetch')) {
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
