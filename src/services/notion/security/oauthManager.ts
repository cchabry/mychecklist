
/**
 * Gestionnaire OAuth pour Notion
 * Gère le flux d'authentification OAuth avec Notion
 */

import { toast } from 'sonner';
import { structuredLogger } from '../logging/structuredLogger';
import { notionErrorService } from '../errorHandling/errorService';
import { NotionTokenType } from '../errorHandling/types';

/**
 * Options de configuration pour le gestionnaire OAuth
 */
export interface OAuthManagerOptions {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  tokenStorageKey?: string;
  stateStorageKey?: string;
  scopes?: string[];
}

/**
 * Token d'accès Notion avec métadonnées
 */
export interface NotionAccessToken {
  access_token: string;
  token_type: string;
  bot_id?: string;
  workspace_id?: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner?: {
    type: string;
    user?: {
      id: string;
      name: string;
      avatar_url?: string;
    }
  };
  duplicated_template_id?: string;
  expires_at?: number;
  refresh_token?: string;
}

/**
 * Gestionnaire pour l'authentification OAuth avec Notion
 */
class NotionOAuthManager {
  private options: OAuthManagerOptions;
  private token: NotionAccessToken | null = null;
  
  constructor(options?: OAuthManagerOptions) {
    this.options = {
      tokenStorageKey: 'notion_oauth_token',
      stateStorageKey: 'notion_oauth_state',
      scopes: ['read_content', 'update_content', 'read_user', 'read_api'],
      ...options
    };
    
    // Essayer de charger le token depuis le localStorage
    this.loadTokenFromStorage();
  }
  
  /**
   * Configure le gestionnaire OAuth
   */
  public configure(options: OAuthManagerOptions): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    structuredLogger.info(
      'Gestionnaire OAuth configuré', 
      { 
        clientId: !!this.options.clientId, 
        hasRedirectUri: !!this.options.redirectUri 
      },
      { source: 'NotionOAuth' }
    );
  }
  
  /**
   * Charge le token depuis le stockage
   */
  private loadTokenFromStorage(): void {
    try {
      const tokenJson = localStorage.getItem(this.options.tokenStorageKey || 'notion_oauth_token');
      if (tokenJson) {
        this.token = JSON.parse(tokenJson);
        structuredLogger.debug(
          'Token OAuth chargé depuis le stockage',
          null,
          { source: 'NotionOAuth' }
        );
      }
    } catch (error) {
      structuredLogger.warn(
        'Erreur lors du chargement du token OAuth',
        error,
        { source: 'NotionOAuth' }
      );
    }
  }
  
  /**
   * Enregistre le token dans le stockage
   */
  private saveTokenToStorage(token: NotionAccessToken): void {
    try {
      localStorage.setItem(this.options.tokenStorageKey || 'notion_oauth_token', JSON.stringify(token));
      structuredLogger.debug(
        'Token OAuth enregistré dans le stockage',
        null,
        { source: 'NotionOAuth' }
      );
    } catch (error) {
      structuredLogger.warn(
        'Erreur lors de l\'enregistrement du token OAuth',
        error,
        { source: 'NotionOAuth' }
      );
    }
  }
  
  /**
   * Génère une URL d'autorisation pour démarrer le flux OAuth
   */
  public getAuthorizationUrl(): string {
    // Vérifier que les infos nécessaires sont présentes
    if (!this.options.clientId || !this.options.redirectUri) {
      throw new Error('Configuration OAuth incomplète (clientId ou redirectUri manquant)');
    }
    
    // Générer un état aléatoire pour la sécurité
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(this.options.stateStorageKey || 'notion_oauth_state', state);
    
    // Construire l'URL
    const url = new URL('https://api.notion.com/v1/oauth/authorize');
    url.searchParams.append('client_id', this.options.clientId);
    url.searchParams.append('redirect_uri', this.options.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', state);
    
    if (this.options.scopes && this.options.scopes.length > 0) {
      url.searchParams.append('scope', this.options.scopes.join(' '));
    }
    
    structuredLogger.info(
      'URL d\'autorisation OAuth générée',
      { url: url.toString() },
      { source: 'NotionOAuth' }
    );
    
    return url.toString();
  }
  
  /**
   * Gère la redirection après l'autorisation
   */
  public async handleRedirect(queryParams: URLSearchParams): Promise<NotionAccessToken | null> {
    try {
      // Vérifier l'erreur
      const error = queryParams.get('error');
      if (error) {
        const errorDescription = queryParams.get('error_description') || 'Erreur non spécifiée';
        throw new Error(`Erreur OAuth: ${error} - ${errorDescription}`);
      }
      
      // Récupérer et vérifier le code et l'état
      const code = queryParams.get('code');
      const state = queryParams.get('state');
      const savedState = localStorage.getItem(this.options.stateStorageKey || 'notion_oauth_state');
      
      if (!code) {
        throw new Error('Code d\'autorisation manquant dans la redirection');
      }
      
      if (!state || state !== savedState) {
        throw new Error('État OAuth invalide, possible tentative de CSRF');
      }
      
      // Échanger le code contre un token
      const token = await this.exchangeCodeForToken(code);
      
      // Enregistrer le token et le retourner
      this.token = token;
      this.saveTokenToStorage(token);
      
      structuredLogger.info(
        'Authentification OAuth réussie',
        { workspace: token.workspace_name },
        { source: 'NotionOAuth' }
      );
      
      toast.success('Connexion à Notion réussie', {
        description: `Connecté à l'espace de travail ${token.workspace_name || 'Notion'}`
      });
      
      return token;
    } catch (error) {
      // Gérer et signaler l'erreur
      notionErrorService.reportError(
        error,
        'Redirection OAuth Notion',
        { 
          type: 'auth',
          severity: 'error'
        }
      );
      
      structuredLogger.error(
        'Erreur lors de la gestion de la redirection OAuth',
        error,
        { source: 'NotionOAuth' }
      );
      
      toast.error('Erreur de connexion à Notion', {
        description: error.message
      });
      
      return null;
    }
  }
  
  /**
   * Échange un code d'autorisation contre un token d'accès
   */
  private async exchangeCodeForToken(code: string): Promise<NotionAccessToken> {
    // Vérifier que les infos nécessaires sont présentes
    if (!this.options.clientId || !this.options.redirectUri) {
      throw new Error('Configuration OAuth incomplète (clientId ou redirectUri manquant)');
    }
    
    try {
      // Faire la requête pour échanger le code contre un token
      // Note: Cela nécessite généralement un serveur backend pour protéger le client_secret
      
      // Simuler un token pour le moment
      // IMPORTANT: Dans une implémentation réelle, cette requête devrait être faite depuis un serveur
      const mockToken: NotionAccessToken = {
        access_token: 'mock_token_' + Math.random().toString(36).substring(2, 15),
        token_type: 'bearer',
        workspace_name: 'Espace de travail Notion',
        workspace_id: 'mock_workspace_id',
        expires_at: Date.now() + 3600000 // 1 heure
      };
      
      return mockToken;
    } catch (error) {
      structuredLogger.error(
        'Erreur lors de l\'échange du code contre un token',
        error,
        { source: 'NotionOAuth' }
      );
      
      throw error;
    }
  }
  
  /**
   * Vérifie si un token est présent et valide
   */
  public hasValidToken(): boolean {
    if (!this.token) {
      return false;
    }
    
    // Vérifier si le token est expiré
    if (this.token.expires_at && this.token.expires_at < Date.now()) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Obtient le token d'accès
   */
  public getAccessToken(): string | null {
    if (!this.hasValidToken()) {
      return null;
    }
    
    return this.token?.access_token || null;
  }
  
  /**
   * Détermine le type de token
   */
  public getTokenType(): NotionTokenType {
    if (!this.token) {
      return NotionTokenType.NONE;
    }
    
    return NotionTokenType.OAUTH;
  }
  
  /**
   * Déconnecte l'utilisateur en supprimant le token
   */
  public logout(): void {
    this.token = null;
    localStorage.removeItem(this.options.tokenStorageKey || 'notion_oauth_token');
    
    structuredLogger.info(
      'Déconnexion OAuth effectuée',
      null,
      { source: 'NotionOAuth' }
    );
    
    toast.info('Déconnexion de Notion effectuée');
  }
}

// Créer une instance singleton
export const notionOAuthManager = new NotionOAuthManager();

// Exporter par défaut
export default notionOAuthManager;
