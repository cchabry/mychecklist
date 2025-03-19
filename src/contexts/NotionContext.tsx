
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotionConfig, NotionConfig, NotionConnectionStatus } from '@/hooks/useNotionConfig';
import { notionApi } from '@/lib/notionProxy';
import { NotionErrorDetails, getStoredNotionError } from '@/lib/notionProxy/errorHandling';

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
  // Utiliser notre hook centralisé
  const notionConfig = useNotionConfig();
  
  // État UI supplémentaire
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState<NotionErrorDetails | null>(null);
  
  // Charger les erreurs stockées
  useEffect(() => {
    const storedError = getStoredNotionError();
    if (storedError) {
      setNotionErrorDetails(storedError);
    }
  }, [notionConfig.status.error]);
  
  // Masquer les détails d'erreur
  const hideNotionError = () => {
    setNotionErrorDetails(null);
    setShowErrorDetails(false);
  };
  
  // Valeur du contexte
  const value: NotionContextValue = {
    // Informations de configuration
    config: notionConfig.config,
    status: notionConfig.status,
    
    // États UI
    showConfig: notionConfig.showConfig,
    showErrorDetails,
    notionErrorDetails,
    
    // Valeurs calculées
    usingNotion: notionConfig.usingNotion,
    
    // Actions
    updateConfig: notionConfig.updateConfig,
    testConnection: notionConfig.testConnection,
    resetAndTest: notionConfig.resetAndTest,
    openConfig: notionConfig.openConfig,
    closeConfig: notionConfig.closeConfig,
    setShowErrorDetails,
    hideNotionError
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
