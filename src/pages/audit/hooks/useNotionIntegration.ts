
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
        description: 'L\'application utilise des données de test en raison des restrictions de sécurité du navigateur (CORS).'
      });
    }
  }, [usingNotion]);
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setUsingNotion(true);
    
    // Si le mode mock est actif, afficher un message explicatif supplémentaire
    if (notionApi.mockMode.isActive()) {
      toast.info('Limitation technique du navigateur', {
        description: 'La connexion à l\'API Notion ne peut pas être établie directement depuis le navigateur. Un serveur intermédiaire serait nécessaire.',
        duration: 8000,
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
      console.log('Notion connection verified via proxy');
      return true;
    } catch (error) {
      console.error('Notion connection verification failed:', error);
      
      // Gérer l'erreur CORS "Failed to fetch"
      if (error.message?.includes('Failed to fetch')) {
        showNotionError(
          'Limitation technique: Failed to fetch', 
          'Les restrictions de sécurité du navigateur (CORS) empêchent l\'accès direct à l\'API Notion. Un serveur intermédiaire serait nécessaire.'
        );
        
        // Activer le mode mock et expliquer la situation
        notionApi.mockMode.activate();
        
        toast.warning('Mode démonstration activé', {
          description: 'L\'application utilisera des données de test car l\'API Notion n\'est pas accessible directement depuis le navigateur.',
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
