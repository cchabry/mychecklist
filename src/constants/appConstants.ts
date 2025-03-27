
/**
 * Constantes d'application générales
 * 
 * Ce fichier centralise toutes les constantes globales utilisées dans l'application
 * qui ne sont pas des messages d'erreur ou des tokens de design.
 */

// Modes opérationnels
export const OPERATION_MODE = {
  REAL: 'real',
  DEMO: 'demo'
};

// Délais et intervalles (en millisecondes)
export const TIMEOUT = {
  DEFAULT: 30000,     // 30 secondes
  SHORT: 5000,        // 5 secondes
  LONG: 60000         // 1 minute
};

// Limites
export const LIMITS = {
  MAX_ATTACHMENTS: 5,
  MAX_PAGES_PER_PROJECT: 50,
  MAX_COMMENT_LENGTH: 1000
};

// Clés de stockage local
export const STORAGE_KEYS = {
  OPERATION_MODE: 'operationMode',
  AUTH_TOKEN: 'authToken',
  NOTION_CONFIG: 'notionConfig',
  USER_PREFERENCES: 'userPreferences'
};
