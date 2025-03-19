
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isNotionConfigured, getNotionConfig, testNotionConnection } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

type NotionErrorDetails = {
  show: boolean;
  error: string;
  context: string;
};

interface NotionContextType {
  // États
  isConnected: boolean;
  isLoading: boolean;
  showConfig: boolean;
  error: string | null;
  showErrorDetails: boolean;
  notionErrorDetails: NotionErrorDetails;
  isMockMode: boolean;
  
  // Actions
  setShowConfig: (show: boolean) => void;
  setShowErrorDetails: (show: boolean) => void;
  handleConfigOpen: () => void;
  handleConfigClose: () => void;
  handleShowErrorDetails: () => void;
  handleCloseErrorDetails: () => void;
  handleResetAndTest: () => void;
  checkNotionConfig: () => Promise<void>;
  handleConnectNotionClick: () => void;
  handleNotionConfigSuccess: () => void;
  handleNotionConfigClose: () => void;
  hideNotionError: () => void;
  
  // Propriétés calculées
  usingNotion: boolean;
  notionConfigOpen: boolean;
  
  // Données de configuration
  config: {
    apiKey: string;
    databaseId: string;
    checklistsDbId: string;
    lastConfigDate: string | null;
  };
}

const NotionContext = createContext<NotionContextType | null>(null);

export const NotionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  
  // État pour les détails d'erreur
  const [notionErrorDetails, setNotionErrorDetails] = useState<NotionErrorDetails>({
    show: false,
    error: '',
    context: ''
  });
  
  // Configuration
  const [config, setConfig] = useState(getNotionConfig());
  
  // Fonction pour vérifier la configuration Notion
  const checkNotionConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    // Vérifier si Notion est configuré
    const hasConfig = isNotionConfigured();
    const mockModeActive = notionApi.mockMode.isActive();
    setIsMockMode(mockModeActive);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Vérification de la configuration Notion:', {
        'Notion configuré': hasConfig,
        'Mode mock actif': mockModeActive,
      });
    }
    
    if (!hasConfig) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }
    
    // Si on est en mode mock, on considère ça comme "non connecté"
    if (mockModeActive) {
      setIsConnected(false);
      setIsLoading(false);
      
      // Si une erreur existe dans le stockage, la récupérer
      const lastError = localStorage.getItem('notion_last_error');
      if (lastError) {
        try {
          const errorData = JSON.parse(lastError);
          setError(errorData.message || 'Erreur de connexion à Notion');
        } catch (e) {
          setError('Erreur de connexion à Notion');
        }
      }
      return;
    }
    
    try {
      // Tester la connexion à Notion
      const testResult = await testNotionConnection();
      
      if (testResult.success) {
        // Connexion réussie
        localStorage.removeItem('notion_last_error');
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        
        setIsConnected(true);
        setError(null);
      } else {
        // Échec de connexion
        setIsConnected(false);
        setError(testResult.error || 'Erreur de connexion à Notion');
      }
    } catch (testError) {
      console.error('❌ Test de connexion Notion échoué:', testError);
      
      // Stocker l'erreur pour référence future
      try {
        localStorage.setItem('notion_last_error', JSON.stringify({
          timestamp: Date.now(),
          message: testError.message || 'Erreur de connexion à Notion'
        }));
      } catch (e) {
        // Ignorer les erreurs de JSON.stringify
      }
      
      setIsConnected(false);
      setError(testError.message || 'Erreur de connexion à Notion');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Vérifier la configuration au chargement
  useEffect(() => {
    checkNotionConfig();
    // Mettre à jour la configuration
    setConfig(getNotionConfig());
  }, []);
  
  // Gérer l'ouverture de la configuration
  const handleConfigOpen = () => {
    setShowConfig(true);
  };
  
  // Gérer la fermeture de la configuration
  const handleConfigClose = () => {
    setShowConfig(false);
    // Revérifier après fermeture
    checkNotionConfig();
    // Mettre à jour la configuration
    setConfig(getNotionConfig());
  };
  
  // Gérer l'ouverture des détails d'erreur
  const handleShowErrorDetails = () => {
    setShowErrorDetails(true);
  };
  
  // Gérer la fermeture des détails d'erreur
  const handleCloseErrorDetails = () => {
    setShowErrorDetails(false);
  };
  
  // Gérer la réinitialisation du mode mock et tester à nouveau
  const handleResetAndTest = () => {
    // Réinitialiser le mode mock
    notionApi.mockMode.forceReset();
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion en mode réel...'
    });
    
    // Effacer les erreurs stockées
    localStorage.removeItem('notion_last_error');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    
    // Vérifier à nouveau la configuration après un court délai
    setTimeout(() => {
      checkNotionConfig();
      // Mettre à jour la configuration
      setConfig(getNotionConfig());
    }, 500);
  };
  
  // Fonctions ajoutées pour la compatibilité
  const handleConnectNotionClick = () => {
    setShowConfig(true);
  };
  
  const handleNotionConfigSuccess = () => {
    checkNotionConfig();
    // Mettre à jour la configuration
    setConfig(getNotionConfig());
  };
  
  const handleNotionConfigClose = () => {
    setShowConfig(false);
    checkNotionConfig();
    // Mettre à jour la configuration
    setConfig(getNotionConfig());
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  // Calculer si on utilise Notion (configuré et connecté)
  const usingNotion = isConnected && isNotionConfigured();
  
  // Renommage de showConfig pour la compatibilité
  const notionConfigOpen = showConfig;
  
  const value: NotionContextType = {
    isConnected,
    isLoading,
    showConfig,
    error,
    showErrorDetails,
    notionErrorDetails,
    isMockMode,
    
    setShowConfig,
    setShowErrorDetails,
    handleConfigOpen,
    handleConfigClose,
    handleShowErrorDetails,
    handleCloseErrorDetails,
    handleResetAndTest,
    checkNotionConfig,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose,
    hideNotionError,
    
    usingNotion,
    notionConfigOpen,
    config
  };
  
  return (
    <NotionContext.Provider value={value}>
      {children}
    </NotionContext.Provider>
  );
};

export const useNotion = (): NotionContextType => {
  const context = useContext(NotionContext);
  if (!context) {
    throw new Error('useNotion doit être utilisé à l\'intérieur d\'un NotionProvider');
  }
  return context;
};
