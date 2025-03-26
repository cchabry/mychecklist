
/**
 * Utilitaires pour la gestion des erreurs
 */
import type { NotionError, NotionErrorType } from '../types/unified';
import { notionErrorService } from './notionErrorService';

export const errorUtils = {
  /**
   * Extrait les informations utiles d'une erreur
   */
  extractErrorInfo(error: Error | NotionError | unknown): {
    message: string;
    type: NotionErrorType;
    stack?: string;
    details?: any;
  } {
    // Si c'est une NotionError
    if (typeof error === 'object' && error !== null && 'type' in error && 'severity' in error) {
      const notionError = error as NotionError;
      return {
        message: notionError.message,
        type: notionError.type,
        stack: notionError.stack,
        details: notionError.details
      };
    }
    
    // Si c'est une Error standard
    if (error instanceof Error) {
      return {
        message: error.message,
        type: notionErrorService.identifyErrorType(error),
        stack: error.stack
      };
    }
    
    // Autre type d'erreur
    return {
      message: String(error),
      type: NotionErrorType.UNKNOWN
    };
  },
  
  /**
   * Formate une erreur pour l'affichage
   */
  formatErrorForDisplay(error: Error | NotionError | unknown): string {
    const info = this.extractErrorInfo(error);
    return `${info.type}: ${info.message}`;
  },
  
  /**
   * Vérifie si une erreur est récupérable
   */
  isRecoverable(error: Error | NotionError | unknown): boolean {
    // Si c'est une NotionError avec recoverable défini
    if (typeof error === 'object' && error !== null && 'recoverable' in error) {
      return Boolean((error as NotionError).recoverable);
    }
    
    // Par défaut, considérer certains types d'erreurs comme récupérables
    const info = this.extractErrorInfo(error);
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT
    ].includes(info.type);
  },
  
  /**
   * Vérifie si une erreur est liée à l'authentification
   */
  isAuthError(error: Error | NotionError | unknown): boolean {
    const info = this.extractErrorInfo(error);
    return info.type === NotionErrorType.AUTH;
  },
  
  /**
   * Vérifie si une erreur est liée à une permission
   */
  isPermissionError(error: Error | NotionError | unknown): boolean {
    const info = this.extractErrorInfo(error);
    return info.type === NotionErrorType.PERMISSION;
  }
};
