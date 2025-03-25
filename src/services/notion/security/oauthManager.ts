
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { proxyManager } from '@/services/apiProxy';
import { encryptData, decryptData } from './encryption';
import { validateToken, identifyTokenType, NotionTokenType } from './tokenValidation';

/**
 * Configuration pour le gestionnaire OAuth Notion
 */
export interface NotionOAuthConfig {
  // ID client pour l'application OAuth Notion
  clientId: string;
  
  // Secret client pour l'application OAuth Notion (ne devrait être utilisé que côté serveur)
  clientSecret?: string;
  
  // URL de redirection après authentification
  redirectUri: string;
  
  // Scopes d'accès demandés
  scopes?: string[];
  
  // Fonction de rappel pour les erreurs d'authentification
  onAuthError?: (error: Error) => void;
  
  // Fonction de rappel après rafraîchissement du token
  onTokenRefreshed?: () => void;
  
  // Fonction de rappel après déconnexion
  onLogout?: () => void;
  
  // Activer le rafraîchissement automatique des tokens
  autoRefresh?: boolean;
}

/**
 * Interface pour les jetons OAuth Notion
 */
export interface NotionOAuthTokens {
  // Jeton d'accès pour l'API Notion
  access_token: string;
  
  // Date d'expiration du jeton d'accès (timestamp)
  expires_at: number;
  
  // Jeton de rafraîchissement pour obtenir un nouveau jeton d'accès
  refresh_token?: string;
  
  // Type du jeton (bearer)
  token_type: string;
  
  // ID de l'espace de travail Notion
  workspace_id?: string;
  
  // Identifiant de propriétaire du jeton
  owner?: {
    user?: {
      id: string;
      name?: string;
    }
  };
}

/**
 * Clés de stockage pour les données OAuth
 */
const STORAGE_KEYS = {
  TOKENS: 'notion_oauth_tokens',
  STATE: 'notion_oauth_state',
};

/**
 * Configuration par défaut pour OAuth Notion
 */
const DEFAULT_CONFIG: NotionOAuthConfig = {
  clientId: process.env.VITE_NOTION_OAUTH_CLIENT_ID || '123456789',
  redirectUri: `${window.location.origin}/notion-callback`,
  scopes: ['read_user', 'read_databases', 'read_pages', 'update_pages', 'read_blocks', 'update_blocks'],
};

/**
 * Classe principale pour gérer l'authentification OAuth avec Notion
 */
export class NotionOAuthManager {
  private config: NotionOAuthConfig;
  private tokens: NotionOAuthTokens | null = null;
  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;
  
  constructor(config: Partial<NotionOAuthConfig> = {}) {
    // Fusion de la configuration par défaut avec celle fournie
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Charger les tokens s'ils existent
    this.loadTokens();
    
    // Configurer le rafraîchissement automatique si activé
    if (this.config.autoRefresh && this.tokens) {
      this.scheduleTokenRefresh();
    }
  }
  
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.tokens?.access_token;
  }
  
  /**
   * Obtient le jeton d'accès actuel
   */
  getAccessToken(): string | null {
    return this.tokens?.access_token || null;
  }
  
  /**
   * Obtient toutes les informations sur les jetons
   */
  getTokenInfo(): {
    accessToken: string | null;
    tokenType: NotionTokenType;
    expiresAt: Date | null;
    workspaceId: string | null;
    userName: string | null;
    isExpired: boolean;
    willExpireSoon: boolean;
  } {
    const now = new Date();
    const expiresAt = this.tokens?.expires_at ? new Date(this.tokens.expires_at) : null;
    
    // Calculer si le token est expiré ou expire bientôt (moins de 30 minutes)
    const isExpired = expiresAt ? now > expiresAt : false;
    const willExpireSoon = expiresAt ? 
      now > new Date(expiresAt.getTime() - 30 * 60 * 1000) : 
      false;
    
    return {
      accessToken: this.tokens?.access_token || null,
      tokenType: this.tokens ? NotionTokenType.OAUTH : NotionTokenType.NONE,
      expiresAt,
      workspaceId: this.tokens?.workspace_id || null,
      userName: this.tokens?.owner?.user?.name || null,
      isExpired,
      willExpireSoon
    };
  }
  
  /**
   * Démarre le flux d'authentification OAuth
   */
  startAuthFlow(): void {
    try {
      // Générer un état pour la sécurité CSRF
      const state = uuidv4();
      localStorage.setItem(STORAGE_KEYS.STATE, state);
      
      // Construire l'URL d'autorisation
      const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
      authUrl.searchParams.append('client_id', this.config.clientId);
      authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('state', state);
      
      if (this.config.scopes && this.config.scopes.length > 0) {
        authUrl.searchParams.append('scope', this.config.scopes.join(','));
      }
      
      // Rediriger vers la page d'autorisation Notion
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Erreur lors du démarrage du flux OAuth:', error);
      
      if (this.config.onAuthError) {
        this.config.onAuthError(error instanceof Error ? error : new Error(String(error)));
      }
      
      toast.error('Erreur de connexion', {
        description: 'Impossible de démarrer le processus d\'authentification Notion'
      });
    }
  }
  
  /**
   * Traite le callback OAuth après redirection de Notion
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    // Vérifier l'état pour la sécurité CSRF
    const savedState = localStorage.getItem(STORAGE_KEYS.STATE);
    if (!savedState || savedState !== state) {
      const error = new Error('État OAuth invalide, possible tentative CSRF');
      
      if (this.config.onAuthError) {
        this.config.onAuthError(error);
      }
      
      toast.error('Erreur de sécurité', {
        description: 'Validation de l\'authentification échouée. Veuillez réessayer.'
      });
      
      return false;
    }
    
    try {
      // Effacer l'état stocké
      localStorage.removeItem(STORAGE_KEYS.STATE);
      
      // Échanger le code contre des tokens
      const response = await proxyManager.post('/v1/oauth/token', {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId
      });
      
      if (!response.success || !response.data) {
        throw new Error('Échec de l\'échange de code: ' + 
          (response.error?.message || 'Réponse invalide'));
      }
      
      // Calculer la date d'expiration
      const responseData = response.data as any;
      const expiresAt = Date.now() + (responseData.expires_in * 1000);
      
      // Enregistrer les tokens
      const tokens: NotionOAuthTokens = {
        ...responseData,
        expires_at: expiresAt
      };
      
      this.saveTokens(tokens);
      
      // Configurer le rafraîchissement automatique si activé
      if (this.config.autoRefresh) {
        this.scheduleTokenRefresh();
      }
      
      toast.success('Connexion réussie à Notion', {
        description: 'Vous êtes maintenant connecté via OAuth'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors du traitement du callback OAuth:', error);
      
      if (this.config.onAuthError) {
        this.config.onAuthError(error instanceof Error ? error : new Error(String(error)));
      }
      
      toast.error('Échec de connexion', {
        description: error instanceof Error ? error.message : 'Erreur lors de l\'authentification'
      });
      
      return false;
    }
  }
  
  /**
   * Rafraîchit le token OAuth
   */
  async refreshToken(): Promise<boolean> {
    if (!this.tokens || !this.tokens.refresh_token) {
      console.error('Aucun token de rafraîchissement disponible');
      return false;
    }
    
    try {
      // Annuler tout rafraîchissement programmé
      if (this.tokenRefreshTimeout) {
        clearTimeout(this.tokenRefreshTimeout);
        this.tokenRefreshTimeout = null;
      }
      
      // Appeler l'API pour rafraîchir le token
      const response = await proxyManager.post('/v1/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refresh_token,
        client_id: this.config.clientId
      });
      
      if (!response.success || !response.data) {
        throw new Error('Échec du rafraîchissement du token: ' + 
          (response.error?.message || 'Réponse invalide'));
      }
      
      // Calculer la nouvelle date d'expiration
      const responseData = response.data as any;
      const expiresAt = Date.now() + (responseData.expires_in * 1000);
      
      // Mettre à jour les tokens avec les nouvelles valeurs
      this.saveTokens({
        ...(this.tokens as NotionOAuthTokens),
        ...responseData,
        expires_at: expiresAt
      });
      
      // Reprogrammer le rafraîchissement si nécessaire
      if (this.config.autoRefresh) {
        this.scheduleTokenRefresh();
      }
      
      // Appeler le callback de rafraîchissement
      if (this.config.onTokenRefreshed) {
        this.config.onTokenRefreshed();
      }
      
      console.log('Token OAuth rafraîchi avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token OAuth:', error);
      
      if (this.config.onAuthError) {
        this.config.onAuthError(error instanceof Error ? error : new Error(String(error)));
      }
      
      toast.error('Échec du rafraîchissement', {
        description: 'Impossible de rafraîchir la session Notion. Reconnexion nécessaire.'
      });
      
      return false;
    }
  }
  
  /**
   * Se déconnecte et supprime les tokens
   */
  logout(): void {
    // Annuler tout rafraîchissement programmé
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
    
    // Supprimer les tokens
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    this.tokens = null;
    
    // Appeler le callback de déconnexion
    if (this.config.onLogout) {
      this.config.onLogout();
    }
    
    toast.info('Déconnexion', {
      description: 'Vous avez été déconnecté de Notion'
    });
  }
  
  /**
   * Programme le rafraîchissement automatique du token
   */
  private scheduleTokenRefresh(): void {
    // Annuler tout rafraîchissement déjà programmé
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
    
    if (!this.tokens || !this.tokens.expires_at) {
      return;
    }
    
    // Calculer quand rafraîchir (5 minutes avant expiration)
    const now = Date.now();
    const expiresAt = this.tokens.expires_at;
    const refreshTime = expiresAt - now - (5 * 60 * 1000);
    
    if (refreshTime <= 0) {
      // Le token est déjà expiré ou expire dans moins de 5 minutes, rafraîchir immédiatement
      this.refreshToken();
      return;
    }
    
    // Programmer le rafraîchissement
    this.tokenRefreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
    
    console.log(`Token OAuth programmé pour rafraîchissement dans ${Math.round(refreshTime / 60000)} minutes`);
  }
  
  /**
   * Charge les tokens depuis le stockage
   */
  private loadTokens(): void {
    try {
      const encryptedTokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (!encryptedTokens) {
        return;
      }
      
      // Déchiffrer les tokens
      const decryptedTokens = decryptData(encryptedTokens);
      if (!decryptedTokens) {
        console.error('Impossible de déchiffrer les tokens OAuth');
        return;
      }
      
      this.tokens = JSON.parse(decryptedTokens);
      
      // Vérifier si le token est expiré
      if (this.tokens && this.tokens.expires_at) {
        const now = Date.now();
        const expiresAt = this.tokens.expires_at;
        
        if (now >= expiresAt) {
          console.log('Token OAuth expiré, tentative de rafraîchissement');
          // Tenter de rafraîchir si possible
          if (this.tokens.refresh_token) {
            this.refreshToken();
          } else {
            console.warn('Token OAuth expiré sans token de rafraîchissement');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tokens OAuth:', error);
      // En cas d'erreur, supprimer les tokens pour éviter des problèmes futurs
      localStorage.removeItem(STORAGE_KEYS.TOKENS);
      this.tokens = null;
    }
  }
  
  /**
   * Enregistre les tokens dans le stockage
   */
  private saveTokens(tokens: NotionOAuthTokens): void {
    try {
      this.tokens = tokens;
      
      // Chiffrer les tokens avant stockage
      const encrypted = encryptData(JSON.stringify(tokens));
      localStorage.setItem(STORAGE_KEYS.TOKENS, encrypted);
      
      console.log('Tokens OAuth enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des tokens OAuth:', error);
    }
  }
}

// Exporter une instance par défaut
export const oauthManager = new NotionOAuthManager();

// Exporter par défaut
export default oauthManager;
