
import { useState, useEffect, useCallback } from 'react';
import { oauthManager, NotionOAuthConfig, NotionOAuthTokens } from '@/services/notion/security/oauthManager';
import { useOperationMode } from '@/services/operationMode';
import { NotionTokenType } from '@/services/notion/security/tokenValidation';

/**
 * Options pour le hook useNotionOAuth
 */
export interface UseNotionOAuthOptions extends Partial<NotionOAuthConfig> {
  // Force la connexion automatique si un token OAuth valide est présent
  autoLogin?: boolean;
}

/**
 * Hook pour gérer l'authentification OAuth avec Notion
 * Fournit une interface simplifiée pour le gestionnaire OAuth
 */
export function useNotionOAuth(options: UseNotionOAuthOptions = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { enableRealMode } = useOperationMode();
  
  // Configurer le gestionnaire OAuth avec les options fournies
  useEffect(() => {
    // Recréer une instance avec les options fournies n'est pas nécessaire
    // car l'instance est un singleton, mais on peut mettre à jour certaines options
    if (options.onTokenRefreshed) {
      // Cette logique serait implémentée dans une version plus avancée
    }
    
    setIsInitialized(true);
  }, [options]);
  
  // Vérifier l'état du token et rafraîchir si nécessaire
  useEffect(() => {
    if (!isInitialized) return;
    
    const tokenInfo = oauthManager.getTokenInfo();
    
    // Si le token est sur le point d'expirer, le rafraîchir
    if (tokenInfo.willExpireSoon && tokenInfo.accessToken && options.autoRefresh !== false) {
      refreshToken();
    }
  }, [isInitialized, options.autoRefresh]);
  
  /**
   * Démarre le flux d'authentification OAuth
   */
  const startOAuthFlow = useCallback(() => {
    setIsAuthenticating(true);
    
    // Passer au mode réel avant de commencer l'authentification
    enableRealMode();
    
    // Lancer le flux d'authentification
    oauthManager.startAuthFlow();
  }, [enableRealMode]);
  
  /**
   * Gère le callback OAuth après la redirection
   */
  const handleCallback = useCallback(async (code: string, state: string): Promise<boolean> => {
    setIsAuthenticating(true);
    
    try {
      // Traiter le callback OAuth
      const success = await oauthManager.handleCallback(code, state);
      
      if (success) {
        // Passer en mode réel après une authentification réussie
        enableRealMode();
      }
      
      return success;
    } finally {
      setIsAuthenticating(false);
    }
  }, [enableRealMode]);
  
  /**
   * Rafraîchit le token OAuth
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    
    try {
      return await oauthManager.refreshToken();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);
  
  /**
   * Déconnecte l'utilisateur et supprime les tokens
   */
  const logout = useCallback(async (): Promise<void> => {
    oauthManager.logout();
  }, []);
  
  // Récupérer les informations sur le token
  const tokenInfo = oauthManager.getTokenInfo();
  
  return {
    // État
    isInitialized,
    isAuthenticating,
    isRefreshing,
    isAuthenticated: oauthManager.isAuthenticated(),
    
    // Informations sur le token
    accessToken: tokenInfo.accessToken,
    tokenType: tokenInfo.tokenType,
    expiresAt: tokenInfo.expiresAt,
    workspaceId: tokenInfo.workspaceId,
    userName: tokenInfo.userName,
    tokenIsExpired: tokenInfo.isExpired,
    tokenWillExpireSoon: tokenInfo.willExpireSoon,
    
    // Actions
    startOAuthFlow,
    handleCallback,
    refreshToken,
    logout
  };
}

export default useNotionOAuth;
