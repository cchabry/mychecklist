
import { useState } from 'react';

/**
 * Hook pour gérer la configuration de Notion
 */
export const useNotionConfig = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);

  const handleConfigOpen = () => {
    setNotionConfigOpen(true);
  };

  const handleConfigClose = () => {
    setNotionConfigOpen(false);
  };

  const handleConnectNotionClick = () => {
    setShowConfig(true);
  };

  const handleNotionConfigSuccess = () => {
    setShowConfig(false);
    setNotionConfigOpen(false);
  };

  const handleNotionConfigClose = () => {
    setShowConfig(false);
  };

  return {
    showConfig,
    setShowConfig,
    notionConfigOpen,
    handleConfigOpen,
    handleConfigClose,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose
  };
};
