
/**
 * Types pour les services API
 */

/**
 * Filtres pour les requêtes
 */
export interface QueryFilters {
  [key: string]: any;
}

/**
 * Options pour les requêtes
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

/**
 * Pagination des résultats
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
