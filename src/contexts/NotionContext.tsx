
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotionConfig, NotionConfig, NotionConnectionStatus } from '@/hooks/useNotionConfig';
import { useNotionErrorState } from '@/hooks/notion/useNotionErrorState';
import { NotionErrorDetails } from '@/lib/notionProxy/errorHandling';

interface NotionContextValue {
  // Config et état de connexion
  config: NotionConfig;
  status: NotionConnectionStatus;
  
  // États UI
  showConfig: boolean;
  showErrorDetails: boolean;
  notionErrorDetails: NotionErrorDetails | null;
  
  // Valeurs calculées
  usingNotion: boolean;
  
  // Actions
  updateConfig: (config: Partial<NotionConfig>) => void;
  testConnection: () => Promise<boolean>;
  resetAndTest: () => Promise<void>;
  openConfig: () => void;
  closeConfig: () => void;
  setShowErrorDetails: (show: boolean) => void;
  hideNotionError: () => void;
}

const NotionContext = createContext<NotionContextValue | null>(null);

export const NotionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Utiliser notre hook centralisé pour la configuration
  const notionConfig = useNotionConfig();
  
  // Utiliser notre hook spécialisé pour la gestion des erreurs
  const errorState = useNotionErrorState();
  
  // Valeur du contexte
  const value: NotionContextValue = {
    // Informations de configuration
    config: notionConfig.config,
    status: notionConfig.status,
    
    // États UI
    showConfig: notionConfig.showConfig,
    showErrorDetails: errorState.showErrorDetails,
    notionErrorDetails: errorState.notionErrorDetails,
    
    // Valeurs calculées
    usingNotion: notionConfig.usingNotion,
    
    // Actions
    updateConfig: notionConfig.updateConfig,
    testConnection: notionConfig.testConnection,
    resetAndTest: notionConfig.resetAndTest,
    openConfig: notionConfig.openConfig,
    closeConfig: notionConfig.closeConfig,
    setShowErrorDetails: errorState.setShowErrorDetails,
    hideNotionError: errorState.hideNotionError
  };
  
  return (
    <NotionContext.Provider value={value}>
      {children}
    </NotionContext.Provider>
  );
};

export const useNotion = (): NotionContextValue => {
  const context = useContext(NotionContext);
  if (!context) {
    throw new Error('useNotion doit être utilisé à l\'intérieur d\'un NotionProvider');
  }
  return context;
};
