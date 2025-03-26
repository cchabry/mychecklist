
/**
 * Types spécifiques à l'intégration avec Notion
 */

// Configuration de l'intégration Notion
export interface NotionConfig {
  apiKey: string | null;
  databaseIds: {
    projects: string | null;
    checklists: string | null;
    exigences: string | null;
    pages: string | null;
    audits: string | null;
    evaluations: string | null;
    actions: string | null;
    progress: string | null;
  };
  operationMode: 'real' | 'demo' | 'auto';
  oauth?: {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
  };
}

// Types d'erreurs Notion
export enum NotionErrorType {
  API = 'api',
  NETWORK = 'network',
  AUTH = 'auth',
  RATE_LIMIT = 'rate_limit',
  CONFIG = 'config',
  DATABASE = 'database',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// Niveaux de sévérité des erreurs
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface pour les erreurs structurées
export interface NotionErrorOptions {
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  cause?: Error | unknown;
  context?: string;
  retryable?: boolean;
  statusCode?: number;
}

// Interface pour les fonctions de mapping Notion <-> App
export interface NotionMapper<T, N> {
  toNotion(data: T): N;
  fromNotion(data: N): T;
}

// Options pour les requêtes Notion
export interface NotionRequestOptions {
  useCache?: boolean;
  cacheTime?: number;
  retries?: number;
  timeout?: number;
}

// Statut de la connexion Notion
export interface NotionConnectionStatus {
  connected: boolean;
  lastChecked: Date | null;
  apiAvailable: boolean;
  databasesAvailable: boolean;
  error?: string;
  isMockMode: boolean;
}
