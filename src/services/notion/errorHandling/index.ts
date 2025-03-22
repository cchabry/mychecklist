
/**
 * Point d'entrée pour le module de gestion d'erreurs Notion
 */

// Exporter le service principal
export { notionErrorService } from './errorService';

// Exporter les types
export type { 
  NotionError,
  NotionErrorOptions,
  NotionErrorSubscriber,
  NotionErrorHandler
} from './types';

// Exporter les enums
export { 
  NotionErrorType,
  NotionErrorSeverity
} from './types';

// Exporter les utilitaires
export { notionErrorUtils } from './utils';

// Exporter un hook pour accéder au service
export { useNotionErrorService } from './useNotionErrorService';
