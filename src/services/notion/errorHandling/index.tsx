
// Exporter les services et les hooks
import { notionErrorService } from './notionErrorService';
import { notionRetryQueue } from './retryQueue';
import useNotionErrorService from '@/hooks/notion/useNotionErrorService';
import useRetryQueue from '@/hooks/notion/useRetryQueue';
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions
} from '../types/unified';
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
  NotionErrorOptions,
  autoRetryHandler,
  errorUtils
};

// Fonction utilitaire pour créer une erreur Notion compatible
export const createNotionError = (
  message: string,
  type: NotionErrorType = NotionErrorType.UNKNOWN,
  options: Partial<NotionErrorOptions> = {}
): NotionError => {
  const { 
    severity = NotionErrorSeverity.ERROR,
    retryable = false,
    context,
    operation,
    ...restOptions
  } = options;

  return notionErrorService.createError(message, type, {
    severity,
    retryable,
    context,
    operation,
    ...restOptions
  });
};
