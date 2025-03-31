
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { notionService, ConnectionStatus, NotionAPIResponse } from '@/services/notion/client';
import OAuthTokenMonitor from '@/components/notion/security/OAuthTokenMonitor';
import { useNotionOAuth } from '@/hooks/notion/useNotionOAuth';
import { identifyTokenType, NotionTokenType } from '@/services/notion/security/tokenValidation';

// Types pour le context
interface NotionServiceContextType {
  // État de la connexion
  isConfigured: boolean;
  connectionStatus: ConnectionStatus;
  lastError: Error | null;
  isConnected: boolean;
  isLoading: boolean;
  isOAuthToken: boolean;
  
  // Configuration
  setNotionConfig: (apiKey: string, databaseId: string, checklistsDbId?: string) => void;
  testConnection: () => Promise<NotionAPIResponse<any>>;
  
  // OAuth
  startOAuthFlow: () => void;
  refreshOAuthToken: () => Promise<void>;
  logoutOAuth: () => Promise<void>;
  
  // Accès aux services
  notion: typeof notionService;
}

// Valeurs par défaut
const defaultContext: NotionServiceContextType = {
  isConfigured: false,
  connectionStatus: ConnectionStatus.Disconnected,
  lastError: null,
  isConnected: false,
  isLoading: false,
  isOAuthToken: false,
  
  setNotionConfig: () => {},
  testConnection: async () => ({ success: false, error: { message: 'Non initialisé' } }),
  
  startOAuthFlow: () => {},
  refreshOAuthToken: async () => {},
  logoutOAuth: async () => {},
  
  notion: notionService
};

// Créer le context
const NotionServiceContext = createContext<NotionServiceContextType>(defaultContext);

// Props pour le provider
interface NotionServiceProviderProps {
  children: ReactNode;
}

// Provider pour le context
export const NotionServiceProvider: React.FC<NotionServiceProviderProps> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKeyType, setApiKeyType] = useState<NotionTokenType>(NotionTokenType.UNKNOWN);
  
  // Utiliser notre hook OAuth
  const { 
    startOAuthFlow, 
    refreshToken, 
    logout, 
    isAuthenticated 
  } = useNotionOAuth({
    onTokenRefreshed: () => {
      // Retester la connexion après un rafraîchissement de token
      testConnection();
    }
  });
  
  // Initialiser à partir de la configuration stockée
  useEffect(() => {
    const checkConfig = async () => {
      const hasConfig = notionService.isConfigured();
      setIsConfigured(hasConfig);
      
      if (hasConfig) {
        // Déterminer le type de token
        const apiKey = localStorage.getItem('notion_api_key') || '';
        const tokenType = identifyTokenType(apiKey);
        setApiKeyType(tokenType);
        
        setIsLoading(true);
        try {
          const response = await notionService.testConnection();
          setConnectionStatus(response.success ? ConnectionStatus.Connected : ConnectionStatus.Error);
          
          if (!response.success && response.error) {
            setLastError(new Error(response.error.message));
          }
        } catch (error) {
          setConnectionStatus(ConnectionStatus.Error);
          setLastError(error instanceof Error ? error : new Error(String(error)));
        } finally {
          setIsLoading(false);
        }
      } else {
        setConnectionStatus(ConnectionStatus.Disconnected);
      }
    };
    
    checkConfig();
  }, []);
  
  // Configurer Notion
  const setNotionConfig = (apiKey: string, databaseId: string, checklistsDbId?: string) => {
    try {
      notionService.configure(apiKey, databaseId, checklistsDbId);
      
      // Déterminer le type de token
      const tokenType = identifyTokenType(apiKey);
      setApiKeyType(tokenType);
      
      setIsConfigured(true);
      toast.success('Configuration Notion sauvegardée');
    } catch (error) {
      toast.error('Erreur lors de la configuration Notion', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };
  
  // Tester la connexion
  const testConnection = async (): Promise<NotionAPIResponse<any>> => {
    setIsLoading(true);
    
    try {
      const response = await notionService.testConnection();
      
      setConnectionStatus(response.success ? ConnectionStatus.Connected : ConnectionStatus.Error);
      
      if (!response.success && response.error) {
        setLastError(new Error(response.error.message));
        
        toast.error('Erreur de connexion à Notion', {
          description: response.error.message
        });
      } else if (response.success) {
        setLastError(null);
        
        toast.success('Connexion à Notion réussie', {
          description: `Connecté en tant que ${response.data?.user}`
        });
      }
      
      return response;
    } catch (error) {
      setConnectionStatus(ConnectionStatus.Error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLastError(error instanceof Error ? error : new Error(errorMessage));
      
      toast.error('Erreur de connexion à Notion', {
        description: errorMessage
      });
      
      return {
        success: false,
        error: {
          message: errorMessage
        }
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rafraîchir un token OAuth
  const refreshOAuthToken = async (): Promise<void> => {
    if (apiKeyType !== NotionTokenType.OAUTH) {
      return;
    }
    
    await refreshToken();
    
    // Retester la connexion après le rafraîchissement
    await testConnection();
  };
  
  // Calculer si connecté
  const isConnected = connectionStatus === ConnectionStatus.Connected;
  
  // Valeur du context
  const contextValue: NotionServiceContextType = {
    isConfigured,
    connectionStatus,
    lastError,
    isConnected,
    isLoading,
    isOAuthToken: apiKeyType === NotionTokenType.OAUTH,
    
    setNotionConfig,
    testConnection,
    
    startOAuthFlow,
    refreshOAuthToken,
    logoutOAuth: logout,
    
    notion: notionService
  };
  
  return (
    <NotionServiceContext.Provider value={contextValue}>
      {children}
      {/* Intégrer le moniteur OAuth */}
      <OAuthTokenMonitor 
        disabled={apiKeyType !== NotionTokenType.OAUTH || !isAuthenticated}
        onTokenRefreshed={() => testConnection()}
      />
    </NotionServiceContext.Provider>
  );
};

// Hook pour utiliser le context
export const useNotionService = () => useContext(NotionServiceContext);
