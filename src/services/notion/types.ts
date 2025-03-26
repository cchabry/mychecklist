
/**
 * Types unifiés pour l'API Notion
 * Fournit des interfaces communes pour tous les services Notion
 */

// Types de base pour les réponses de l'API
export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Type pour les erreurs Notion
export enum NotionErrorType {
  NETWORK = 'network',
  AUTH = 'authentication',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Type pour la sévérité des erreurs
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface pour les erreurs Notion
export interface NotionError {
  id: string;
  message: string;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  timestamp: number;
  context?: string;
  retryable: boolean;
  originalError?: Error;
}

// Types pour les résultats de diagnostic
export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: string;
  timestamp: number;
}

// Type pour les projets
export interface NotionProject {
  id: string;
  title: string;
  url?: string;
  description?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  notionPageId?: string;
}

// Type pour les bases de données
export interface NotionDatabase {
  id: string;
  properties: Record<string, any>;
  title?: string;
  description?: string;
  lastEditedTime?: string;
}

// Type pour les utilisateurs
export interface NotionUser {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

// Type pour les pages
export interface NotionPage {
  id: string;
  title: string;
  url?: string;
  properties?: Record<string, any>;
  createdTime?: string;
  lastEditedTime?: string;
  parent?: {
    type: 'database_id' | 'page_id';
    id: string;
  };
}

// Type pour les items de checklist
export interface NotionChecklistItem {
  id: string;
  title: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  properties?: Record<string, any>;
}

// Ajout d'un commentaire pour déclencher le build
// Build lancé suite à la restauration d'une ancienne version
