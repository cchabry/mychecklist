
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
  const [initialProjectsDbId, setInitialProjectsDbId] = useState<string>('');
  const [initialChecklistsDbId, setInitialChecklistsDbId] = useState<string>('');
  
  // Charger les valeurs initiales depuis localStorage à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem('notion_api_key') || '';
      const savedProjectsDbId = localStorage.getItem('notion_database_id') || '';
      const savedChecklistsDbId = localStorage.getItem('notion_checklists_database_id') || '';
      
      setInitialApiKey(savedApiKey);
      setInitialProjectsDbId(savedProjectsDbId);
      setInitialChecklistsDbId(savedChecklistsDbId);
      
      // Log pour debug
      console.log('📝 Modal Notion ouverte, chargement des valeurs:', {
        apiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : 'vide',
        projectsDbId: savedProjectsDbId || 'vide',
        checklistsDbId: savedChecklistsDbId || 'vide'
      });

      // Réinitialiser les erreurs à chaque ouverture
      setError('');
      setErrorContext('');
    }
  }, [isOpen]);
  
  const handleFormSubmit = async (apiKey: string, projectsDbId: string, checklistsDbId: string) => {
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
    
    // Nettoyer l'ID de la base de données des projets
    const cleanProjectsDbId = extractNotionDatabaseId(projectsDbId);
    if (!cleanProjectsDbId) {
      setError('ID de base de données Projets invalide');
      return;
    }
    
    // Nettoyer l'ID de la base de données des checklists (optionnel pour le moment)
    const cleanChecklistsDbId = checklistsDbId ? extractNotionDatabaseId(checklistsDbId) : '';
    
    console.log('🧹 Using database IDs:', {
      projects: cleanProjectsDbId,
      checklists: cleanChecklistsDbId || '(non fourni)'
    });
    
    // Sauvegarder les valeurs dans localStorage immédiatement
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', cleanProjectsDbId);
    
    // Sauvegarder l'ID de la base de données des checklists s'il est fourni
    if (cleanChecklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', cleanChecklistsDbId);
    }
    
    console.log('💾 Valeurs sauvegardées dans localStorage:', {
      apiKey: `${apiKey.substring(0, 8)}...`,
      projectsDbId: cleanProjectsDbId,
      checklistsDbId: cleanChecklistsDbId || '(non fourni)',
      tokenType: isOAuthToken(apiKey) ? 'OAuth (ntn_)' : 'Integration (secret_)'
    });
    
    // Commencer par désactiver le mode mock s'il était activé
    if (notionApi.mockMode.isActive()) {
      console.log('🔄 Désactivation du mode mock avant test de connexion');
      notionApi.mockMode.deactivate();
    }
    
    // Tester la connexion à l'API Notion via notre proxy
    try {
      console.log('🔄 Testing connection to Notion API with key:', apiKey.substring(0, 9) + '...');
      
      // Configurer Notion pour définir les valeurs
      configureNotion(apiKey, cleanProjectsDbId, cleanChecklistsDbId);
      
      // Tester la connexion via le proxy
      const user = await notionApi.users.me(apiKey);
      console.log('✅ Notion API connection successful via proxy, user:', user.name);
      
      // Tester l'accès à la base de données des projets
      try {
        console.log('🔄 Testing projects database access for ID:', cleanProjectsDbId);
        const dbResponse = await notionApi.databases.retrieve(cleanProjectsDbId, apiKey);
        console.log('✅ Projects database access successful via proxy:', dbResponse.title?.[0]?.plain_text || cleanProjectsDbId);
        
        // Tester l'accès à la base de données des checklists si elle est fournie
        if (cleanChecklistsDbId) {
          try {
            console.log('🔄 Testing checklists database access for ID:', cleanChecklistsDbId);
            const checklistDbResponse = await notionApi.databases.retrieve(cleanChecklistsDbId, apiKey);
            console.log('✅ Checklists database access successful via proxy:', checklistDbResponse.title?.[0]?.plain_text || cleanChecklistsDbId);
          } catch (checklistDbError) {
            console.error('❌ Checklists database access failed:', checklistDbError);
            setError('Erreur d\'accès à la base de données des checklists: ' + (checklistDbError.message || 'Vérifiez l\'ID'));
            setErrorContext('Vérifiez que votre intégration a été ajoutée à la base de données des checklists dans Notion');
            return;
          }
        }
      } catch (dbError) {
        console.error('❌ Projects database access failed:', dbError);
        
        // Différencier les erreurs d'autorisation des erreurs d'ID invalide
        if (dbError.message?.includes('404') || dbError.message?.includes('not_found')) {
          setError('Base de données des projets introuvable: ' + (dbError.message || 'Vérifiez l\'ID'));
          setErrorContext('L\'ID de base de données fourni n\'existe pas ou n\'est pas accessible');
        } else {
          setError('Erreur d\'accès à la base de données des projets: ' + (dbError.message || 'Vérifiez l\'ID et les permissions'));
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
      console.error('❌ Connection test failed:', connectionError);
      
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
              Connectez vos bases de données Notion pour synchroniser vos audits
            </DialogDescription>
          </DialogHeader>
          
          {/* Afficher si le mode mock est actif */}
          {notionApi.mockMode.isActive() && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
              <p className="text-sm text-amber-700 font-medium">
                Mode démonstration actuellement actif
              </p>
              <p className="text-xs text-amber-600 mt-1">
                En configurant Notion, vous tenterez de désactiver le mode démonstration.
              </p>
            </div>
          )}
          
          <NotionConfigForm 
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            initialApiKey={initialApiKey}
            initialProjectsDbId={initialProjectsDbId}
            initialChecklistsDbId={initialChecklistsDbId}
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
