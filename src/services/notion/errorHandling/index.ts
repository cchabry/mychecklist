
/**
 * Point d'entrée pour le module de gestion d'erreurs Notion
 */

// Exporter le service principal de gestion d'erreur
export { notionErrorService } from './errorService';

// Exporter le service de file d'attente de retry
export { notionRetryQueue } from './retryQueue';

// Exporter l'utilitaire de retry automatique
export { autoRetryHandler } from './autoRetry';

// Exporter les types
export type { 
  NotionError,
  NotionErrorOptions,
  NotionErrorSubscriber
} from './types';

// Exporter les enums
export { 
  NotionErrorType,
  NotionErrorSeverity
} from './types';

// Exporter les utilitaires
export { notionErrorUtils } from './utils';

// Exporter les hooks
export { useNotionErrorService } from './useNotionErrorService';
export { useNotionRetryQueue } from './useRetryQueue';
export { useAutoRetry } from './useAutoRetry';
