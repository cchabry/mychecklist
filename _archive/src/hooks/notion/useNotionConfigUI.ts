
import { useState } from 'react';

/**
 * Hook spécialisé pour gérer les éléments d'interface utilisateur 
 * liés à la configuration Notion
 */
export function useNotionConfigUI() {
  const [showConfig, setShowConfig] = useState(false);
  
  // Actions d'interface
  const openConfig = () => setShowConfig(true);
  const closeConfig = () => setShowConfig(false);
  
  return {
    showConfig,
    openConfig,
    closeConfig
  };
}
