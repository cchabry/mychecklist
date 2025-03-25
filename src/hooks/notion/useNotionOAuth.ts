
import { useState, useCallback } from 'react';
import { NotionTokenType } from '@/services/notion/errorHandling/types';

export interface UseNotionOAuthOptions {
  clientId?: string;
  redirectUri?: string;
  onTokenRefreshed?: () => void;
  autoRefresh?: boolean;
  onAuthError?: (error: Error) => void;
}

/**
 * Hook neutralisé pour l'authentification OAuth avec Notion
 * Cette fonctionnalité a été désactivée car nous utilisons maintenant exclusivement
 * les fonctions Netlify qui gèrent l'authentification côté serveur.
 */
export function useNotionOAuth(options: UseNotionOAuthOptions = {}) {
  // Valeurs d'état par défaut qui indiquent que OAuth n'est pas utilisé
  const [isAuthenticated] = useState<boolean>(true);
  const [tokenType] = useState<NotionTokenType>(NotionTokenType.INTEGRATION);
  const [expiresAt] = useState<Date | null>(null);
  const [tokenWillExpireSoon] = useState<boolean>(false);

  // Fonctions neutralisées qui ne font rien mais maintiennent l'interface
  const startOAuthFlow = useCallback(() => {
    console.log('Fonction OAuth désactivée - utilisation des fonctions Netlify');
  }, []);

  const refreshToken = useCallback(async () => {
    console.log('Fonction OAuth désactivée - utilisation des fonctions Netlify');
    return true;
  }, []);

  const logout = useCallback(async () => {
    console.log('Fonction OAuth désactivée - utilisation des fonctions Netlify');
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

// Types pour compatibilité
export enum NotionTokenType {
  NONE = 'none',
  INTEGRATION = 'integration',
  OAUTH = 'oauth',
  UNKNOWN = 'unknown'
}
