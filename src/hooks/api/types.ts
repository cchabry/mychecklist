
/**
 * Types communs pour les hooks d'API
 */

/**
 * Options pour les requêtes
 */
export interface QueryOptions {
  immediate?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Filtres pour les requêtes
 */
export interface QueryFilters {
  [key: string]: any;
}
