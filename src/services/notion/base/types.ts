
/**
 * Types pour les services de base
 */

/**
 * Options de filtre standard pour les requêtes
 */
export interface StandardFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Interface de base pour un service CRUD
 */
export interface CrudService<T, CreateDataType = Omit<T, 'id'>, UpdateDataType = Partial<T>> {
  getAll(filter?: StandardFilterOptions): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDataType): Promise<T>;
  update(data: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Type pour la réponse Notion standard
 */
export interface NotionResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

/**
 * Réponse d'API générique
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

/**
 * Configuration de base pour Notion API
 */
export interface NotionConfig {
  apiKey: string;
  projectsDbId: string;
  auditsDbId?: string;
  exigencesDbId?: string;
  checklistDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  progressDbId?: string;
  mode?: 'real' | 'mock' | 'auto';
  debug?: boolean;
}

/**
 * Résultat du test de connexion
 */
export interface ConnectionTestResult {
  success: boolean;
  user?: string;
  workspaceName?: string;
  projectsDbName?: string;
  checklistsDbName?: string;
  error?: string;
  details?: unknown;
}
