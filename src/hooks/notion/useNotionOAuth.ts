
import { useState, useEffect, useCallback } from 'react';
import { NotionTokenType } from '@/services/notion/errorHandling/types';

// Importations sécurisées avec vérification d'existence
let oauthManager: any = null;
let NotionOAuthConfig: any = null;
let NotionOAuthTokens: any = null;

// Essayer d'importer dynamiquement si le module existe
try {
  const oauthModule = require('@/services/notion/security/oauthManager');
  oauthManager = oauthModule.default || oauthModule.oauthManager;
  NotionOAuthConfig = oauthModule.NotionOAuthConfig;
  NotionOAuthTokens = oauthModule.NotionOAuthTokens;
} catch (e) {
  console.warn('Module oauthManager non disponible, fonctionnalités OAuth limitées');
}

export interface UseNotionOAuthOptions {
  clientId?: string;
  redirectUri?: string;
  onTokenRefreshed?: () => void;
  autoRefresh?: boolean;
  onAuthError?: (error: Error) => void;
}

/**
 * Hook pour gérer l'authentification OAuth avec Notion
 */
export function useNotionOAuth(options: UseNotionOAuthOptions = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokenType, setTokenType] = useState<NotionTokenType>(NotionTokenType.UNKNOWN);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [tokenWillExpireSoon, setTokenWillExpireSoon] = useState<boolean>(false);

  // Si les options incluent onTokenRefreshed, configurer le callback
  useEffect(() => {
    if (options.onTokenRefreshed && oauthManager) {
      oauthManager.setTokenRefreshCallback(options.onTokenRefreshed);
    }
    return () => {
      if (oauthManager) {
        oauthManager.setTokenRefreshCallback(null);
      }
    };
  }, [options.onTokenRefreshed]);

  // Vérifier l'état d'authentification
  useEffect(() => {
    if (!oauthManager) return;

    const checkAuth = async () => {
      try {
        const isAuthed = await oauthManager.isAuthenticated();
        setIsAuthenticated(isAuthed);
        
        if (isAuthed) {
          // Récupérer les infos de token
          const tokenInfo = await oauthManager.getTokenInfo();
          setTokenType(NotionTokenType.OAUTH);
          setExpiresAt(tokenInfo?.expiresAt ? new Date(tokenInfo.expiresAt) : null);
          
          // Si autoRefresh est activé, rafraîchir le token s'il expire bientôt
          if (options.autoRefresh && tokenInfo?.needsRefresh) {
            refreshToken();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification OAuth:', error);
        if (options.onAuthError && error instanceof Error) {
          options.onAuthError(error);
        }
      }
    };

    checkAuth();
    
    // Vérifier périodiquement si autoRefresh est activé
    let intervalId: number | undefined;
    if (options.autoRefresh) {
      intervalId = window.setInterval(checkAuth, 5 * 60 * 1000); // Toutes les 5 minutes
    }
    
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [options.autoRefresh]);

  // Démarrer le flux OAuth
  const startOAuthFlow = useCallback(() => {
    if (!oauthManager) {
      console.error('OAuth Manager non disponible');
      return;
    }
    
    oauthManager.startAuthFlow(
      options.clientId, 
      options.redirectUri
    );
  }, [options.clientId, options.redirectUri]);

  // Rafraîchir le token
  const refreshToken = useCallback(async () => {
    if (!oauthManager) {
      console.error('OAuth Manager non disponible');
      return false;
    }
    
    try {
      await oauthManager.refreshAccessToken();
      if (options.onTokenRefreshed) {
        options.onTokenRefreshed();
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      if (options.onAuthError && error instanceof Error) {
        options.onAuthError(error);
      }
      return false;
    }
  }, [options.onTokenRefreshed, options.onAuthError]);

  // Se déconnecter
  const logout = useCallback(async () => {
    if (!oauthManager) {
      console.error('OAuth Manager non disponible');
      return;
    }
    
    try {
      await oauthManager.logout();
      setIsAuthenticated(false);
      setTokenType(NotionTokenType.NONE);
      setExpiresAt(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }, []);

  return {
    isAuthenticated,
    tokenType,
    expiresAt,
    tokenWillExpireSoon,
    startOAuthFlow,
    refreshToken,
    logout
  };
}
