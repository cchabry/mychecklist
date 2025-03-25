
/**
 * Service de gestion OAuth pour Notion
 * Gère le flux d'authentification, le rafraîchissement des tokens et l'expiration
 */

import { tokenStorage } from './tokenStorage';
import { structuredLogger } from '../logging/structuredLogger';
import { identifyTokenType, NotionTokenType } from './tokenValidation';
import { createTokenError } from './tokenValidation';

// Temps par défaut avant expiration (en millisecondes)
// Les tokens OAuth Notion expirent généralement après 8 heures
const DEFAULT_EXPIRATION_TIME = 8 * 60 * 60 * 1000; // 8 heures

// Clés de stockage
const OAUTH_TOKEN_KEY = 'notion_oauth_token';
const OAUTH_REFRESH_TOKEN_KEY = 'notion_oauth_refresh_token';
const OAUTH_EXPIRATION_KEY = 'notion_oauth_expiration';
const OAUTH_WORKSPACE_ID_KEY = 'notion_oauth_workspace_id';
const OAUTH_USER_ID_KEY = 'notion_oauth_user_id';

// Interface pour les données du token OAuth
export interface OAuthTokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  workspaceId?: string;
  userId?: string;
}

/**
 * Interface pour les options de rafraîchissement
 */
export interface RefreshOptions {
  forceRefresh?: boolean;
  silent?: boolean;
  onRefreshFailed?: (error: Error) => void;
}

/**
 * Classe pour gérer l'authentification OAuth Notion
 */
export class NotionOAuthManager {
  // Délai avant expiration pour déclencher un rafraîchissement anticipé (ms)
  private refreshBuffer: number = 10 * 60 * 1000; // 10 minutes
  
  // URL du serveur d'authentification OAuth Notion
  private authServerUrl: string = 'https://api.notion.com/v1/oauth';
  
  // Paramètres de l'application
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string = '';
  
  // État de l'authentification
  private isRefreshing: boolean = false;
  private listeners: Array<(token: string) => void> = [];
  
  /**
   * Initialise le gestionnaire OAuth
   */
  constructor() {
    structuredLogger.debug('Initialisation du gestionnaire OAuth Notion');
  }
  
  /**
   * Configure le gestionnaire OAuth
   */
  configure(config: {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    refreshBuffer?: number;
    authServerUrl?: string;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret || '';
    this.redirectUri = config.redirectUri;
    
    if (config.refreshBuffer) {
      this.refreshBuffer = config.refreshBuffer;
    }
    
    if (config.authServerUrl) {
      this.authServerUrl = config.authServerUrl;
    }
    
    structuredLogger.info('Gestionnaire OAuth configuré', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      hasClientSecret: !!this.clientSecret
    });
    
    return this;
  }
  
  /**
   * Obtient l'URL d'autorisation pour démarrer le flux OAuth
   */
  getAuthorizationUrl(state: string, options: {
    scope?: string[];
    responseType?: 'code';
    owner?: 'user' | 'workspace';
  } = {}) {
    if (!this.clientId) {
      throw new Error('OAuth non configuré: clientId manquant');
    }
    
    if (!this.redirectUri) {
      throw new Error('OAuth non configuré: redirectUri manquant');
    }
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: options.responseType || 'code',
      state,
      owner: options.owner || 'user'
    });
    
    if (options.scope && options.scope.length > 0) {
      params.append('scope', options.scope.join(' '));
    }
    
    return `${this.authServerUrl}/authorize?${params.toString()}`;
  }
  
  /**
   * Échange un code d'autorisation contre un token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokenData> {
    if (!this.clientId) {
      throw new Error('OAuth non configuré: clientId manquant');
    }
    
    if (!this.clientSecret) {
      throw new Error('OAuth non configuré: clientSecret manquant');
    }
    
    try {
      // Cette implémentation doit être faite côté serveur pour sécuriser le client_secret
      // Ici nous supposons l'existence d'un service proxy pour traiter cette opération
      const response = await fetch('/api/notion-oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Erreur d'échange de code');
      }
      
      const data = await response.json();
      
      // Calculer la date d'expiration
      const expiresAt = new Date(Date.now() + (data.expires_in * 1000 || DEFAULT_EXPIRATION_TIME));
      
      // Stocker les informations du token
      const tokenData: OAuthTokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        workspaceId: data.workspace_id,
        userId: data.owner?.user?.id
      };
      
      this.saveTokenData(tokenData);
      
      structuredLogger.info('Token OAuth obtenu avec succès', {
        expiresAt: expiresAt.toISOString(),
        hasRefreshToken: !!data.refresh_token
      });
      
      return tokenData;
    } catch (error) {
      structuredLogger.error('Erreur lors de l\'échange du code OAuth', error, {
        source: 'OAuthManager',
        tags: ['oauth', 'token-exchange']
      });
      throw error;
    }
  }
  
  /**
   * Rafraîchit le token OAuth
   */
  async refreshToken(options: RefreshOptions = {}): Promise<OAuthTokenData> {
    const refreshToken = tokenStorage.getToken(OAUTH_REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      const error = new Error('Pas de refresh token disponible');
      if (!options.silent) {
        structuredLogger.error('Échec du rafraîchissement: pas de refresh token', error, {
          source: 'OAuthManager',
          tags: ['oauth', 'refresh']
        });
      }
      
      if (options.onRefreshFailed) {
        options.onRefreshFailed(error);
      }
      
      throw error;
    }
    
    // Si déjà en cours de rafraîchissement, attendre
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.listeners.push((token) => {
          try {
            const tokenData = this.getTokenData();
            if (tokenData) {
              resolve(tokenData);
            } else {
              reject(new Error('Échec de récupération des données du token après rafraîchissement'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    this.isRefreshing = true;
    
    try {
      // Cette opération doit être effectuée côté serveur pour protéger le client_secret
      const response = await fetch('/api/notion-oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Erreur de rafraîchissement de token');
      }
      
      const data = await response.json();
      
      // Calculer la date d'expiration
      const expiresAt = new Date(Date.now() + (data.expires_in * 1000 || DEFAULT_EXPIRATION_TIME));
      
      // Stocker les informations du token
      const tokenData: OAuthTokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Conserver l'ancien si pas de nouveau
        expiresAt,
        workspaceId: data.workspace_id || tokenStorage.getToken(OAUTH_WORKSPACE_ID_KEY),
        userId: data.owner?.user?.id || tokenStorage.getToken(OAUTH_USER_ID_KEY)
      };
      
      this.saveTokenData(tokenData);
      
      structuredLogger.info('Token OAuth rafraîchi avec succès', {
        expiresAt: expiresAt.toISOString(),
        hasNewRefreshToken: !!data.refresh_token
      });
      
      // Notifier les listeners
      this.listeners.forEach(listener => listener(data.access_token));
      this.listeners = [];
      
      return tokenData;
    } catch (error) {
      if (!options.silent) {
        structuredLogger.error('Erreur lors du rafraîchissement du token OAuth', error, {
          source: 'OAuthManager',
          tags: ['oauth', 'refresh']
        });
      }
      
      if (options.onRefreshFailed) {
        options.onRefreshFailed(error instanceof Error ? error : new Error(String(error)));
      }
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }
  
  /**
   * Vérifie si un rafraîchissement est nécessaire
   */
  shouldRefreshToken(): boolean {
    try {
      const expirationStr = tokenStorage.getToken(OAUTH_EXPIRATION_KEY);
      if (!expirationStr) return false;
      
      const expiresAt = new Date(expirationStr);
      const now = new Date();
      
      // Si le token expire bientôt (dans moins que le buffer défini)
      return (expiresAt.getTime() - now.getTime()) < this.refreshBuffer;
    } catch (error) {
      structuredLogger.warn('Erreur lors de la vérification d\'expiration du token', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired(): boolean {
    try {
      const expirationStr = tokenStorage.getToken(OAUTH_EXPIRATION_KEY);
      if (!expirationStr) return false;
      
      const expiresAt = new Date(expirationStr);
      const now = new Date();
      
      return now > expiresAt;
    } catch (error) {
      structuredLogger.warn('Erreur lors de la vérification d\'expiration du token', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * Obtient le token actuel, rafraîchissant si nécessaire
   */
  async getToken(options?: RefreshOptions): Promise<string> {
    const token = tokenStorage.getToken(OAUTH_TOKEN_KEY);
    
    // Si pas de token, impossible de continuer
    if (!token) {
      const error = createTokenError('Pas de token OAuth disponible');
      
      if (options?.onRefreshFailed) {
        options.onRefreshFailed(error);
      }
      
      throw error;
    }
    
    // Si le token est expiré ou expire bientôt, essayer de le rafraîchir
    if (options?.forceRefresh || this.shouldRefreshToken()) {
      try {
        const newTokenData = await this.refreshToken(options);
        return newTokenData.accessToken;
      } catch (error) {
        // Si le rafraîchissement échoue, utiliser le token existant si pas expiré
        if (!this.isTokenExpired()) {
          return token;
        }
        
        // Sinon relancer l'erreur
        throw error;
      }
    }
    
    return token;
  }
  
  /**
   * Enregistre les données du token
   */
  private saveTokenData(tokenData: OAuthTokenData): void {
    tokenStorage.saveToken(tokenData.accessToken, OAUTH_TOKEN_KEY);
    
    if (tokenData.refreshToken) {
      tokenStorage.saveToken(tokenData.refreshToken, OAUTH_REFRESH_TOKEN_KEY);
    }
    
    if (tokenData.expiresAt) {
      tokenStorage.saveToken(tokenData.expiresAt.toISOString(), OAUTH_EXPIRATION_KEY);
    }
    
    if (tokenData.workspaceId) {
      tokenStorage.saveToken(tokenData.workspaceId, OAUTH_WORKSPACE_ID_KEY);
    }
    
    if (tokenData.userId) {
      tokenStorage.saveToken(tokenData.userId, OAUTH_USER_ID_KEY);
    }
  }
  
  /**
   * Récupère les données du token
   */
  getTokenData(): OAuthTokenData | null {
    const accessToken = tokenStorage.getToken(OAUTH_TOKEN_KEY);
    if (!accessToken) return null;
    
    const refreshToken = tokenStorage.getToken(OAUTH_REFRESH_TOKEN_KEY);
    const expirationStr = tokenStorage.getToken(OAUTH_EXPIRATION_KEY);
    const workspaceId = tokenStorage.getToken(OAUTH_WORKSPACE_ID_KEY);
    const userId = tokenStorage.getToken(OAUTH_USER_ID_KEY);
    
    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expirationStr ? new Date(expirationStr) : undefined,
      workspaceId: workspaceId || undefined,
      userId: userId || undefined
    };
  }
  
  /**
   * Efface les tokens OAuth stockés
   */
  clearTokens(): void {
    tokenStorage.removeToken(OAUTH_TOKEN_KEY);
    tokenStorage.removeToken(OAUTH_REFRESH_TOKEN_KEY);
    tokenStorage.removeToken(OAUTH_EXPIRATION_KEY);
    tokenStorage.removeToken(OAUTH_WORKSPACE_ID_KEY);
    tokenStorage.removeToken(OAUTH_USER_ID_KEY);
    
    structuredLogger.info('Tokens OAuth effacés');
  }
  
  /**
   * Déconnecte l'utilisateur en révoquant le token et nettoyant le stockage
   */
  async logout(): Promise<void> {
    const token = tokenStorage.getToken(OAUTH_TOKEN_KEY);
    
    if (token) {
      try {
        // Tenter de révoquer le token côté serveur
        await fetch('/api/notion-oauth/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            client_id: this.clientId,
            client_secret: this.clientSecret
          })
        });
      } catch (error) {
        structuredLogger.warn('Erreur lors de la révocation du token', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Nettoyer le stockage même si la révocation échoue
    this.clearTokens();
  }
  
  /**
   * Vérifie si un token est un token OAuth
   */
  isOAuthToken(token: string): boolean {
    return identifyTokenType(token) === NotionTokenType.OAUTH;
  }
  
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = tokenStorage.getToken(OAUTH_TOKEN_KEY);
    return !!token && !this.isTokenExpired();
  }
  
  /**
   * Obtient la date d'expiration du token
   */
  getExpiration(): Date | null {
    const expirationStr = tokenStorage.getToken(OAUTH_EXPIRATION_KEY);
    return expirationStr ? new Date(expirationStr) : null;
  }
  
  /**
   * Ajoute un listener pour les événements de rafraîchissement
   */
  addRefreshListener(listener: (token: string) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Exporter une instance par défaut
export const oauthManager = new NotionOAuthManager();

// Export par défaut
export default oauthManager;
