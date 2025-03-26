/**
 * Types pour l'API et les opérations de requête
 */

import { Project, Audit, ChecklistItem, Exigence, SamplePage, Evaluation, CorrectiveAction, ActionProgress } from '../domain/models';

/**
 * Options pour les requêtes API
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  cache?: RequestCache;
}

/**
 * Résultat d'une opération API
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Options communes pour les hooks d'API
 */
export interface QueryOptions<TData = any> {
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: TData | undefined, error: Error | null) => void;
}
