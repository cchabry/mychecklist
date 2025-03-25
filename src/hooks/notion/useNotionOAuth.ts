
/**
 * Hook pour gérer l'authentification OAuth Notion
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotionStorage } from './useNotionStorage';
import { toast } from 'sonner';
import { oauthManager, OAuthTokenData, RefreshOptions } from '@/services/notion/security/oauthManager';
import { identifyTokenType, NotionTokenType } from '@/services/notion/security/tokenValidation';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';

export interface UseNotionOAuthProps {
  onTokenRefreshed?: (tokenData: OAuthTokenData) => void;
  onAuthError?: (error: Error) => void;
  autoRefresh?: boolean;
}

export function useNotionOAuth(props: UseNotionOAuthProps = {}) {
  const { onTokenRefreshed, onAuthError, autoRefresh = true } = props;
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [tokenType, setTokenType] = useState<NotionTokenType>(NotionTokenType.UNKNOWN);
  const storage = useNotionStorage();
  
  // Vérifier l'état d'authentification et le type de token au montage
  useEffect(() => {
    const config = storage.getStoredConfig();
    if (config.apiKey) {
      const type = identifyTokenType(config.apiKey);
      setTokenType(type);
      
      if (type === NotionTokenType.OAUTH) {
        const isAuth = oauthManager.isAuthenticated();
        setIsAuthenticated(isAuth);
        setExpiresAt(oauthManager.getExpiration());
      }
    }
  }, [storage]);
  
  // Configurer le rafraîchissement automatique des tokens
  useEffect(() => {
    if (!autoRefresh || tokenType !== NotionTokenType.OAUTH || !isAuthenticated) {
      return;
    }
    
    // Vérifier toutes les minutes si le token doit être rafraîchi
    const checkInterval = setInterval(() => {
      if (oauthManager.shouldRefreshToken()) {
        refreshToken({ silent: true }).catch(error => {
          structuredLogger.error('Échec du rafraîchissement automatique', error, {
            source: 'useNotionOAuth',
            tags: ['oauth', 'refresh']
          });
        });
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(checkInterval);
  }, [autoRefresh, tokenType, isAuthenticated]);
  
  /**
   * Initie le flux d'authentification OAuth
   */
  const startOAuthFlow = useCallback(() => {
    // Générer un état aléatoire pour sécuriser le flux OAuth
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('notion_oauth_state', state);
    
    // Construire l'URL d'autorisation
    const authUrl = oauthManager.getAuthorizationUrl(state, {
      scope: ['read_user', 'read_databases', 'read_pages', 'write_pages'],
      owner: 'user'
    });
    
    // Ouvrir la fenêtre d'autorisation
    window.location.href = authUrl;
  }, []);
  
  /**
   * Gère le retour du flux OAuth (après redirection)
   */
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      // Vérifier que l'état correspond pour prévenir les attaques CSRF
      const savedState = localStorage.getItem('notion_oauth_state');
      if (!savedState || savedState !== state) {
        throw new Error('État OAuth non valide, possible tentative CSRF');
      }
      
      // Échange le code contre un token
      const tokenData = await oauthManager.exchangeCodeForToken(code);
      
      // Mise à jour de l'état
      setIsAuthenticated(true);
      setExpiresAt(tokenData.expiresAt || null);
      setTokenType(NotionTokenType.OAUTH);
      
      // Mettre à jour la configuration stockée
      if (tokenData.accessToken) {
        storage.updateStoredConfig({
          apiKey: tokenData.accessToken
        });
      }
      
      toast.success('Connexion Notion réussie', {
        description: 'Authentification OAuth complétée'
      });
      
      return tokenData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      toast.error('Erreur d\'authentification Notion', {
        description: errorMessage
      });
      
      if (onAuthError) {
        onAuthError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      structuredLogger.error('Erreur lors du traitement du callback OAuth', error, {
        source: 'useNotionOAuth',
        tags: ['oauth', 'callback']
      });
      
      throw error;
    } finally {
      // Nettoyer l'état OAuth quel que soit le résultat
      localStorage.removeItem('notion_oauth_state');
    }
  }, [storage, onAuthError]);
  
  /**
   * Rafraîchit le token OAuth
   */
  const refreshToken = useCallback(async (options: RefreshOptions = {}) => {
    if (tokenType !== NotionTokenType.OAUTH) {
      return null;
    }
    
    setIsRefreshing(true);
    
    try {
      const tokenData = await oauthManager.refreshToken({
        ...options,
        onRefreshFailed: (error) => {
          if (options.onRefreshFailed) {
            options.onRefreshFailed(error);
          }
          
          if (onAuthError && !options.silent) {
            onAuthError(error);
          }
        }
      });
      
      // Mise à jour de l'état
      setIsAuthenticated(true);
      setExpiresAt(tokenData.expiresAt || null);
      
      // Mettre à jour la configuration stockée
      if (tokenData.accessToken) {
        storage.updateStoredConfig({
          apiKey: tokenData.accessToken
        });
      }
      
      if (onTokenRefreshed) {
        onTokenRefreshed(tokenData);
      }
      
      if (!options.silent) {
        toast.success('Token Notion rafraîchi', {
          description: 'Token OAuth mis à jour avec succès'
        });
      }
      
      return tokenData;
    } catch (error) {
      if (!options.silent) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Erreur de rafraîchissement du token', {
          description: errorMessage
        });
      }
      
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [tokenType, storage, onTokenRefreshed, onAuthError]);
  
  /**
   * Déconnecte l'utilisateur
   */
  const logout = useCallback(async () => {
    try {
      await oauthManager.logout();
      
      // Réinitialiser l'état d'authentification
      setIsAuthenticated(false);
      setExpiresAt(null);
      setTokenType(NotionTokenType.UNKNOWN);
      
      // Nettoyer la clé API stockée
      storage.updateStoredConfig({
        apiKey: ''
      });
      
      toast.success('Déconnexion Notion réussie', {
        description: 'Session OAuth terminée'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      toast.error('Erreur lors de la déconnexion', {
        description: errorMessage
      });
      
      structuredLogger.error('Erreur lors de la déconnexion OAuth', error, {
        source: 'useNotionOAuth',
        tags: ['oauth', 'logout']
      });
    }
  }, [storage]);
  
  return {
    isAuthenticated,
    isRefreshing,
    expiresAt,
    tokenType,
    startOAuthFlow,
    handleOAuthCallback,
    refreshToken,
    logout,
    getToken: oauthManager.getToken.bind(oauthManager),
    tokenWillExpireSoon: oauthManager.shouldRefreshToken()
  };
}
