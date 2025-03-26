
/**
 * Types pour les services API
 * Définit les interfaces communes pour les requêtes et réponses
 */

// Types de base pour les requêtes API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ApiResponseMeta {
  pagination?: PaginationMeta;
  timing?: {
    duration: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Options pour les requêtes
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: any;
  signal?: AbortSignal;
  cache?: RequestCache;
  mode?: RequestMode;
}

// Types pour le filtrage et la pagination
export interface QueryFilters {
  [key: string]: any;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Types pour l'authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Types pour les méthodes HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
