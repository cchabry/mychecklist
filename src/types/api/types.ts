
/**
 * Types de base pour l'API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams {
  pagination?: PaginationParams;
  filters?: FilterParams;
  sort?: SortParams;
}
