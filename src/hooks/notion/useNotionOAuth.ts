
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { NotionTokenType } from '@/services/notion/security/tokenValidation';

interface UseNotionOAuthOptions {
  autoRefresh?: boolean;
  onTokenRefreshed?: () => void;
}

interface NotionOAuthState {
  isAuthenticated: boolean;
  tokenType: NotionTokenType;
  expiresAt: Date | null;
  tokenWillExpireSoon: boolean;
}

/**
 * Hook pour gérer l'authentification OAuth avec Notion
 * 
 * Version simplifiée qui fonctionne sans le module oauthManager
 * qui n'est pas disponible actuellement
 */
export const useNotionOAuth = (options: UseNotionOAuthOptions = {}) => {
  const [state, setState] = useState<NotionOAuthState>({
    isAuthenticated: false,
    tokenType: NotionTokenType.UNKNOWN,
    expiresAt: null,
    tokenWillExpireSoon: false
  });

  // Fonction de démarrage du flux OAuth (simulée)
  const startOAuthFlow = useCallback(() => {
    toast.info("Fonctionnalité OAuth limitée", {
      description: "Le module OAuth n'est pas disponible. Utilisez le mode démo ou configurez manuellement l'API key."
    });
    console.log("Fonctionnalité OAuth limitée. Le module oauthManager n'est pas disponible.");
  }, []);

  // Fonction de rafraîchissement de token (simulée)
  const refreshToken = useCallback(async () => {
    toast.info("Fonctionnalité OAuth limitée", {
      description: "Le rafraîchissement automatique du token n'est pas disponible."
    });
    console.log("Fonctionnalité OAuth limitée. Le rafraîchissement de token n'est pas disponible.");

    if (options.onTokenRefreshed) {
      options.onTokenRefreshed();
    }

    return null;
  }, [options.onTokenRefreshed]);

  // Fonction de déconnexion OAuth (simulée)
  const logout = useCallback(async () => {
    localStorage.removeItem('notion_api_key');
    localStorage.removeItem('notion_database_id');
    
    toast.success("Déconnecté", {
      description: "Les informations d'identification Notion ont été supprimées."
    });
    
    setState({
      isAuthenticated: false,
      tokenType: NotionTokenType.UNKNOWN,
      expiresAt: null,
      tokenWillExpireSoon: false
    });
  }, []);

  // Effet pour vérifier l'état d'authentification
  useEffect(() => {
    const checkAuthState = () => {
      const apiKey = localStorage.getItem('notion_api_key');
      const isAuth = Boolean(apiKey);
      
      // Simuler le type de token - en réalité on déterminerait cela à partir du format du token
      const tokenType = apiKey?.startsWith('ntn_') 
        ? NotionTokenType.OAUTH 
        : apiKey?.startsWith('secret_') 
          ? NotionTokenType.INTEGRATION 
          : NotionTokenType.UNKNOWN;
      
      setState({
        isAuthenticated: isAuth,
        tokenType,
        expiresAt: null, // Dans une implémentation réelle, on stockerait l'expiration
        tokenWillExpireSoon: false
      });
    };
    
    checkAuthState();
  }, []);

  return {
    ...state,
    startOAuthFlow,
    refreshToken,
    logout
  };
};

export default useNotionOAuth;
