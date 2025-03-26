
import { useState } from 'react';
import { isNotionConfigured } from '@/lib/notion';

/**
 * Hook pour gérer l'état et les actions du dialogue de configuration Notion
 */
export const useNotionConfig = () => {
  const [showConfig, setShowConfig] = useState(false);
  
  // Gérer l'ouverture de la configuration
  const handleConfigOpen = () => {
    setShowConfig(true);
  };
  
  // Gérer la fermeture de la configuration
  const handleConfigClose = () => {
    setShowConfig(false);
  };
  
  // Renommage pour compatibilité avec l'interface précédente
  const notionConfigOpen = showConfig;
  
  return {
    showConfig,
    notionConfigOpen,
    setShowConfig,
    handleConfigOpen,
    handleConfigClose,
    handleConnectNotionClick: handleConfigOpen,
    handleNotionConfigClose: handleConfigClose,
    handleNotionConfigSuccess: () => window.location.reload()
  };
};
