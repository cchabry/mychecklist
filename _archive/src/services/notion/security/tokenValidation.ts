
import { NotionErrorType } from '@/services/notion/errorHandling/types';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';

/**
 * Types de tokens Notion
 */
export enum NotionTokenType {
  INTEGRATION = 'integration',
  OAUTH = 'oauth',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour le résultat de validation
 */
export interface TokenValidationResult {
  isValid: boolean;
  type: NotionTokenType;
  error?: string;
}

/**
 * Expression régulière pour valider les tokens d'intégration
 * Format: secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
const INTEGRATION_TOKEN_REGEX = /^secret_[a-zA-Z0-9]{43}$/;

/**
 * Expression régulière pour valider les tokens OAuth
 * Format: ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
const OAUTH_TOKEN_REGEX = /^ntn_[a-zA-Z0-9]{43}$/;

/**
 * Identifie le type de token Notion
 */
export function identifyTokenType(token: string): NotionTokenType {
  if (!token) return NotionTokenType.UNKNOWN;
  
  if (INTEGRATION_TOKEN_REGEX.test(token)) {
    return NotionTokenType.INTEGRATION;
  }
  
  if (OAUTH_TOKEN_REGEX.test(token)) {
    return NotionTokenType.OAUTH;
  }
  
  // Si le token commence par ces préfixes mais ne correspond pas exactement
  // au format attendu, on essaie de le catégoriser quand même
  if (token.startsWith('secret_')) {
    return NotionTokenType.INTEGRATION;
  }
  
  if (token.startsWith('ntn_')) {
    return NotionTokenType.OAUTH;
  }
  
  return NotionTokenType.UNKNOWN;
}

/**
 * Vérifie si un token est valide formellement
 */
export function validateTokenFormat(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      type: NotionTokenType.UNKNOWN,
      error: 'Token manquant'
    };
  }
  
  // Vérifier la longueur minimale
  if (token.length < 10) {
    return {
      isValid: false,
      type: NotionTokenType.UNKNOWN,
      error: 'Token trop court'
    };
  }
  
  // Identifier le type de token
  const tokenType = identifyTokenType(token);
  
  // Valider selon le type
  switch (tokenType) {
    case NotionTokenType.INTEGRATION:
      if (!INTEGRATION_TOKEN_REGEX.test(token)) {
        return {
          isValid: false,
          type: tokenType,
          error: "Format de token d'intégration invalide"
        };
      }
      break;
      
    case NotionTokenType.OAUTH:
      if (!OAUTH_TOKEN_REGEX.test(token)) {
        return {
          isValid: false,
          type: tokenType,
          error: "Format de token OAuth invalide"
        };
      }
      break;
      
    case NotionTokenType.UNKNOWN:
      return {
        isValid: false,
        type: tokenType,
        error: "Type de token inconnu"
      };
  }
  
  // Si on arrive ici, le token est valide formellement
  return {
    isValid: true,
    type: tokenType
  };
}

/**
 * Vérifie le token avec l'API Notion
 */
export async function verifyTokenWithAPI(token: string): Promise<TokenValidationResult> {
  try {
    // Vérifier d'abord le format
    const formatValidation = validateTokenFormat(token);
    if (!formatValidation.isValid) {
      return formatValidation;
    }
    
    // Importer dynamiquement pour éviter les dépendances cycliques
    const { notionApi } = await import('@/lib/notionProxy');
    
    // Tester le token via l'API users/me
    await notionApi.users.me(token);
    
    // Si on arrive ici, le token est valide
    return {
      isValid: true,
      type: formatValidation.type
    };
  } catch (error) {
    // Logger l'erreur
    structuredLogger.error(
      "Échec de la validation du token avec l'API Notion",
      error,
      { source: 'TokenValidator', tags: ['security', 'token'] }
    );
    
    // Créer un message d'erreur approprié
    let errorMessage = "Erreur lors de la validation du token";
    
    // Vérifier si c'est une erreur d'expiration pour les tokens OAuth
    const tokenType = identifyTokenType(token);
    if (tokenType === NotionTokenType.OAUTH && error.status === 401) {
      errorMessage = "Token OAuth expiré";
    } else if (error.status === 401) {
      errorMessage = "Token non autorisé";
    } else if (error.status === 403) {
      errorMessage = "Token sans permission suffisante";
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = "Impossible de se connecter à l'API Notion";
    }
    
    return {
      isValid: false,
      type: identifyTokenType(token),
      error: errorMessage
    };
  }
}

/**
 * Valide le token complet (format + API si possible)
 */
export async function validateToken(token: string, skipApiCheck: boolean = false): Promise<TokenValidationResult> {
  // Vérifier d'abord le format
  const formatValidation = validateTokenFormat(token);
  if (!formatValidation.isValid) {
    return formatValidation;
  }
  
  // Si on doit sauter la vérification API
  if (skipApiCheck) {
    return formatValidation;
  }
  
  // Vérifier avec l'API
  return await verifyTokenWithAPI(token);
}

/**
 * Formate un token pour l'affichage sécurisé
 */
export function obfuscateToken(token: string): string {
  if (!token) return '';
  
  const tokenType = identifyTokenType(token);
  
  if (tokenType === NotionTokenType.INTEGRATION) {
    // Format: secret_******
    return 'secret_' + '*'.repeat(6);
  } else if (tokenType === NotionTokenType.OAUTH) {
    // Format: ntn_******
    return 'ntn_' + '*'.repeat(6);
  } else {
    // Token inconnu, masquer tout sauf les 3 premiers et 3 derniers caractères
    if (token.length <= 6) {
      return '*'.repeat(token.length);
    }
    return token.substring(0, 3) + '*'.repeat(token.length - 6) + token.substring(token.length - 3);
  }
}

/**
 * Crée une erreur de token adaptée
 */
export function createTokenError(message: string, details?: any): Error {
  const error = new Error(message);
  // @ts-ignore
  error.type = NotionErrorType.AUTH;
  // @ts-ignore
  error.details = details;
  return error;
}
