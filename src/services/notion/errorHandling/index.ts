
/**
 * Point d'entrée unifié pour le système de gestion des erreurs Notion
 */

// Importer les services
import { notionErrorService } from './notionErrorService';
import { notionRetryQueue } from './retryQueue';

// Importer les hooks (avec export type pour éviter les erreurs TS1205)
import useNotionErrorService from '@/hooks/notion/useNotionErrorService';
import useRetryQueue from '@/hooks/notion/useRetryQueue';

// Importer les types depuis le fichier unifié
import type { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions
} from '../types/unified';

// Importer les utilitaires
import { autoRetryHandler } from './autoRetry';
import { errorUtils } from './utils';

// Exporter tous les éléments publics du système de gestion d'erreurs
export { 
  notionErrorService, 
  notionRetryQueue,
  useNotionErrorService,
  useRetryQueue,
  autoRetryHandler,
  errorUtils
};

// Exporter les types (avec export type pour éviter les erreurs TS1205)
export type { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions
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
