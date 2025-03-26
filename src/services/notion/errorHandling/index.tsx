
// Exporter les services et les hooks
import { notionErrorService } from './notionErrorService';
import { notionRetryQueue } from './retryQueue';
import { useNotionErrorService } from '@/hooks/notion/useNotionErrorService';
import { useRetryQueue } from '@/hooks/notion/useRetryQueue';
import { NotionError, NotionErrorType, NotionErrorSeverity } from '../types/unified';
import { autoRetryHandler } from './autoRetry';
import { errorUtils } from './utils';

// Exporter tous les éléments publics du système de gestion d'erreurs
export { 
  notionErrorService, 
  notionRetryQueue,
  useNotionErrorService,
  useRetryQueue,
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  autoRetryHandler,
  errorUtils
};

// Fonction utilitaire pour créer une erreur Notion compatible avec les deux systèmes
export const createNotionError = (
  message: string,
  type: NotionErrorType,
  options: {
    severity?: NotionErrorSeverity,
    retryable?: boolean,
    context?: string | Record<string, any>,
    operation?: string,
    originalError?: Error
  } = {}
): NotionError => {
  const { 
    severity = NotionErrorSeverity.ERROR,
    retryable = false,
    context,
    operation,
    originalError
  } = options;

  return {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    type,
    timestamp: Date.now(),
    context,
    operation,
    severity,
    retryable,
    original: originalError
  };
};
