
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotionConfig, NotionConfig, NotionConnectionStatus } from '@/hooks/useNotionConfig';
import { NotionErrorType } from '@/lib/notionProxy/errorHandling';

interface NotionErrorDetails {
  message: string;
  context?: string;
  type: NotionErrorType;
  timestamp?: number;
  stack?: string;
}

interface NotionContextValue {
  // Config et état de connexion
  config: NotionConfig;
  status: NotionConnectionStatus;
  
  // États UI
  showConfig: boolean;
  showErrorModal: boolean;
  errorDetails: NotionErrorDetails | null;
  
  // Valeurs calculées
  usingNotion: boolean;
  hasChecklistsDb: boolean;
  
  // Actions
  updateConfig: (config: Partial<NotionConfig>) => Promise<boolean>;
  testConnection: () => Promise<boolean>;
  resetAndTest: () => Promise<void>;
  openConfig: () => void;
  closeConfig: () => void;
  showError: (error: Error | string, context?: string) => void;
  clearError: () => void;
  openErrorModal: () => void;
  closeErrorModal: () => void;
}

const NotionContext = createContext<NotionContextValue | null>(null);

export const NotionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Utiliser notre hook centralisé pour la configuration
  const notionConfig = useNotionConfig();
  
  // Valeur du contexte (unifié)
  const value: NotionContextValue = {
    // Informations de configuration
    config: notionConfig.config,
    status: notionConfig.status,
    
    // États UI
    showConfig: notionConfig.showConfig,
    showErrorModal: notionConfig.showErrorModal,
    errorDetails: notionConfig.errorDetails,
    
    // Valeurs calculées
    usingNotion: notionConfig.usingNotion,
    hasChecklistsDb: notionConfig.hasChecklistsDb,
    
    // Actions
    updateConfig: notionConfig.updateConfig,
    testConnection: notionConfig.testConnection,
    resetAndTest: notionConfig.resetAndTest,
    openConfig: notionConfig.openConfig,
    closeConfig: notionConfig.closeConfig,
    showError: notionConfig.showError,
    clearError: notionConfig.clearError,
    openErrorModal: notionConfig.openErrorModal,
    closeErrorModal: notionConfig.closeErrorModal
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
