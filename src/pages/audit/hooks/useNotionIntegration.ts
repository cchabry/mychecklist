
import { useEffect } from 'react';
import { isNotionConfigured } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { useNotionConfig } from './useNotionConfig';
import { useNotionConnectionStatus } from './useNotionConnectionStatus';
import { useNotionErrorHandling } from './useNotionErrorHandling';

/**
 * Hook principal pour l'intégration Notion
 * Utilise des hooks spécialisés pour séparer les responsabilités
 */
export const useNotionIntegration = () => {
  // Utiliser nos hooks spécialisés
  const notionConfig = useNotionConfig();
  const connectionStatus = useNotionConnectionStatus();
  const errorHandling = useNotionErrorHandling();
  
  // Mettre à jour les détails d'erreur si une erreur est détectée
  useEffect(() => {
    if (connectionStatus.error) {
      errorHandling.setNotionErrorDetails({
        show: true,
        error: connectionStatus.error,
        context: 'Connexion à l\'API Notion'
      });
    }
  }, [connectionStatus.error]);
  
  // Calculer si on utilise Notion (configuré et connecté)
  const usingNotion = connectionStatus.isConnected && isNotionConfigured();
  
  return {
    // États et propriétés calculées
    isConnected: connectionStatus.isConnected,
    isLoading: connectionStatus.isLoading,
    error: connectionStatus.error,
    showConfig: notionConfig.showConfig,
    notionConfigOpen: notionConfig.notionConfigOpen,
    usingNotion,
    showErrorDetails: errorHandling.showErrorDetails,
    notionErrorDetails: errorHandling.notionErrorDetails,
    
    // Actions de configuration Notion
    setShowConfig: notionConfig.setShowConfig,
    handleConfigOpen: notionConfig.handleConfigOpen,
    handleConfigClose: notionConfig.handleConfigClose,
    handleConnectNotionClick: notionConfig.handleConnectNotionClick,
    handleNotionConfigSuccess: notionConfig.handleNotionConfigSuccess,
    handleNotionConfigClose: notionConfig.handleNotionConfigClose,
    
    // Actions de connexion
    checkNotionConfig: connectionStatus.checkNotionConfig,
    handleResetAndTest: connectionStatus.handleResetAndTest,
    
    // Actions de gestion d'erreur
    setShowErrorDetails: errorHandling.setShowErrorDetails,
    handleShowErrorDetails: errorHandling.handleShowErrorDetails,
    handleCloseErrorDetails: errorHandling.handleCloseErrorDetails,
    hideNotionError: errorHandling.hideNotionError
  };
};
