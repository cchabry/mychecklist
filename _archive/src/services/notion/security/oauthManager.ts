import { structuredLogger } from '../logging/structuredLogger';
import { notionErrorService } from '../errorHandling';
import { NotionErrorType, NotionErrorSeverity } from '../types/unified';

let currentToken: string | null = null;
let tokenExpiry: Date | null = null;
let expirationTimer: number | null = null;

/**
 * Obtient le token OAuth actuel
 */
export function getToken(): string | null {
  return currentToken;
}

/**
 * Définit le token OAuth et sa date d'expiration
 */
export function setToken(token: string, expiresInSeconds: number): void {
  currentToken = token;
  tokenExpiry = new Date(Date.now() + expiresInSeconds * 1000);
  
  // Stocker le token et la date d'expiration
  localStorage.setItem('notion_oauth_token', token);
  localStorage.setItem('notion_oauth_expiry', tokenExpiry.getTime().toString());
  
  // Logger l'enregistrement du token
  structuredLogger.debug('Token OAuth enregistré', null, {
    source: 'OAuthManager',
    expiresAt: tokenExpiry.toISOString()
  });
  
  // Démarrer le minuteur d'expiration
  startExpirationTimer();
}

/**
 * Efface le token OAuth
 */
export function clearToken(): void {
  currentToken = null;
  tokenExpiry = null;
  
  // Supprimer du stockage local
  localStorage.removeItem('notion_oauth_token');
  localStorage.removeItem('notion_oauth_expiry');
  
  // Logger la suppression du token
  structuredLogger.debug('Token OAuth effacé', null, { source: 'OAuthManager' });
  
  // Effacer le minuteur d'expiration
  clearExpirationTimer();
}

/**
 * Vérifie si le token OAuth est valide
 */
export function isValid(): boolean {
  return !!currentToken && !!tokenExpiry && tokenExpiry > new Date();
}

/**
 * Obtient la date d'expiration du token
 */
export function getExpiry(): Date | null {
  return tokenExpiry;
}

/**
 * Démarre le minuteur d'expiration du token
 */
function startExpirationTimer(): void {
  // Effacer le minuteur existant
  clearExpirationTimer();
  
  if (tokenExpiry) {
    const now = Date.now();
    const expiryTime = tokenExpiry.getTime();
    const timeLeft = expiryTime - now;
    
    if (timeLeft > 0) {
      expirationTimer = window.setTimeout(() => {
        structuredLogger.warn('Token OAuth expiré', null, { source: 'OAuthManager' });
        clearToken();
      }, timeLeft);
      
      structuredLogger.debug(`Minuteur d'expiration démarré, expiration dans ${timeLeft}ms`, null, { source: 'OAuthManager' });
    } else {
      structuredLogger.warn('Token OAuth déjà expiré', null, { source: 'OAuthManager' });
      clearToken();
    }
  }
}

/**
 * Efface le minuteur d'expiration du token
 */
function clearExpirationTimer(): void {
  if (expirationTimer) {
    clearTimeout(expirationTimer);
    expirationTimer = null;
    structuredLogger.debug('Minuteur d\'expiration effacé', null, { source: 'OAuthManager' });
  }
}

/**
 * Initialise le token OAuth à partir du stockage local
 */
export function initializeFromStorage(): boolean {
  try {
    const storedToken = localStorage.getItem('notion_oauth_token');
    const storedExpiry = localStorage.getItem('notion_oauth_expiry');
    
    if (!storedToken || !storedExpiry) {
      return false;
    }
    
    currentToken = storedToken;
    tokenExpiry = new Date(Number(storedExpiry));
    
    // Logger l'initialisation
    structuredLogger.debug('Token OAuth chargé depuis le stockage', null, {
      source: 'OAuthManager',
      expiresAt: tokenExpiry.toISOString()
    });
    
    // Démarrer le minuteur d'expiration
    startExpirationTimer();
    
    return true;
  } catch (error) {
    // Signaler l'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    structuredLogger.error(
      `Erreur lors de l'initialisation du token OAuth: ${errorMessage}`,
      error instanceof Error ? error : new Error(errorMessage),
      { source: 'OAuthManager' }
    );
    
    // Créer et signaler une erreur Notion
    const notionError = notionErrorService.createError(
      `Erreur d'initialisation OAuth: ${errorMessage}`,
      {
        type: NotionErrorType.AUTH, 
        severity: NotionErrorSeverity.ERROR,
        cause: error
      }
    );
    
    notionErrorService.reportError(notionError as Error);
    
    return false;
  }
}

/**
 * Force l'expiration du token (pour les tests)
 */
export function forceExpireToken(): void {
  if (tokenExpiry) {
    tokenExpiry = new Date(Date.now() - 1000); // Définir l'expiration dans le passé
    structuredLogger.warn('Expiration forcée du token OAuth (pour test)', null, { source: 'OAuthManager' });
    startExpirationTimer(); // Redémarrer le minuteur pour qu'il détecte l'expiration
  }
}
