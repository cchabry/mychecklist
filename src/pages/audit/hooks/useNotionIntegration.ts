
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

export const useNotionIntegration = () => {
  const [usingNotion, setUsingNotion] = useState(isNotionConfigured());
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState({ 
    show: false, 
    error: '', 
    context: '' 
  });
  
  // Vérifier le mode mock au démarrage
  useEffect(() => {
    // Si Notion est configuré mais qu'on a eu une erreur CORS précédemment
    if (usingNotion && notionApi.mockMode.isActive()) {
      toast.info('Mode démonstration Notion actif', {
        description: 'L\'application utilise des données de test jusqu\'à ce que la connexion au proxy Notion soit établie.'
      });
    }
  }, [usingNotion]);
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setUsingNotion(true);
    
    // Si le mode mock est actif, afficher un message explicatif
    if (notionApi.mockMode.isActive()) {
      toast.info('Notion configuré avec succès', {
        description: 'Les requêtes Notion passeront par un proxy pour contourner les limitations CORS.',
        duration: 5000,
      });
    }
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
  };
  
  const showNotionError = (error: string, context?: string) => {
    setNotionErrorDetails({
      show: true,
      error,
      context: context || ''
    });
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  const verifyNotionConnection = async (): Promise<boolean> => {
    if (!usingNotion) return false;
    
    try {
      const apiKey = localStorage.getItem('notion_api_key');
      if (!apiKey) return false;
      
      await notionApi.users.me(apiKey);
      console.log('Connexion Notion vérifiée via proxy');
      
      // Si on était en mode mock et que ça fonctionne maintenant, désactiver le mode mock
      if (notionApi.mockMode.isActive()) {
        notionApi.mockMode.deactivate();
        toast.success('Connexion avec l\'API Notion établie', {
          description: 'Le mode démonstration a été désactivé, vous utilisez maintenant des données réelles.',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Échec de la vérification de la connexion Notion:', error);
      
      // Gérer l'erreur CORS "Failed to fetch"
      if (error.message?.includes('Failed to fetch')) {
        showNotionError(
          'Tentative de connexion via proxy en cours', 
          'Si les données réelles ne s\'affichent pas, le proxy Vercel n\'est pas encore configuré correctement.'
        );
        
        // Activer le mode mock et expliquer la situation
        notionApi.mockMode.activate();
        
        toast.warning('Mode démonstration activé temporairement', {
          description: 'L\'application utilisera des données de test pendant la configuration du proxy.',
          duration: 6000,
        });
        
        return true; // Permettre l'utilisation en mode mock
      } else {
        toast.error('Erreur d\'accès à Notion', {
          description: 'Impossible de vérifier la connexion à Notion. Vérifiez votre configuration.',
        });
        return false;
      }
    }
  };
  
  return {
    usingNotion,
    notionConfigOpen,
    notionErrorDetails,
    setUsingNotion,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose,
    showNotionError,
    hideNotionError,
    verifyNotionConnection
  };
};
