
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { clearStoredNotionErrors, getStoredNotionError, NotionErrorDetails } from '@/lib/notionProxy/errorHandling';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook centralisé pour gérer les erreurs liées à Notion
 * Unifie la logique d'affichage et de gestion des erreurs
 */
export function useNotionError() {
  // État des erreurs
  const [errorDetails, setErrorDetails] = useState<NotionErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Charger les erreurs stockées au démarrage
  useEffect(() => {
    const storedError = getStoredNotionError();
    if (storedError) {
      setErrorDetails(storedError);
    }
  }, []);
  
  // Afficher une erreur
  const showError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Déterminer le type d'erreur pour personnaliser le message
    const isAuthError = errorMessage.includes('auth') || errorMessage.includes('401');
    const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('403');
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
    
    // Configurer le toast en fonction du type d'erreur
    let toastTitle = 'Erreur Notion';
    let toastDescription = errorMessage;
    
    if (isAuthError) {
      toastTitle = "Erreur d'authentification";
      toastDescription = "Votre clé API Notion est invalide ou a expiré";
    } else if (isPermissionError) {
      toastTitle = "Erreur de permission";
      toastDescription = "Votre intégration n'a pas accès à cette ressource";
    } else if (isNetworkError) {
      toastTitle = "Erreur de connexion";
      toastDescription = "Impossible de se connecter à l'API Notion. Vérifiez votre connexion internet.";
      
      // Activer automatiquement le mode mock pour les erreurs réseau
      if (!notionApi.mockMode.isActive()) {
        notionApi.mockMode.activate();
        toast.info('Mode démonstration activé', {
          description: 'Utilisation de données fictives en attendant le rétablissement de la connexion'
        });
      }
    }
    
    // Afficher le toast d'erreur
    toast.error(toastTitle, { description: toastDescription });
    
    // Mettre à jour l'état des erreurs
    setErrorDetails({
      message: errorMessage,
      type: isAuthError ? 'auth' : isPermissionError ? 'permission' : isNetworkError ? 'network' : 'unknown',
      context,
      timestamp: Date.now()
    });
    
    // Afficher automatiquement le modal pour les erreurs critiques
    if (isAuthError || isPermissionError) {
      setShowErrorModal(true);
    }
  }, []);
  
  // Effacer l'erreur actuelle
  const clearError = useCallback(() => {
    setErrorDetails(null);
    setShowErrorModal(false);
    clearStoredNotionErrors();
  }, []);
  
  // Afficher le modal d'erreur
  const openErrorModal = useCallback(() => {
    setShowErrorModal(true);
  }, []);
  
  // Fermer le modal d'erreur
  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
  }, []);
  
  return {
    errorDetails,
    showErrorModal,
    showError,
    clearError,
    openErrorModal,
    closeErrorModal,
    hasError: !!errorDetails
  };
}
