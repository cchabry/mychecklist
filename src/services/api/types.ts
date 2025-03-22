
import { CacheFetchOptions } from '../cache/types';

/**
 * Interface de base pour les services d'API
 */
export interface BaseApiService<T> {
  // Méthodes CRUD
  getById(id: string, options?: Omit<CacheFetchOptions<T>, 'fetcher'>): Promise<T | null>;
  getAll(options?: Omit<CacheFetchOptions<T[]>, 'fetcher'>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  
  // Méthodes de cache
  invalidateItem(id: string): void;
  invalidateList(): void;
  invalidateAll(): void;
}

/**
 * Options pour configurer un service d'API
 */
export interface ApiServiceOptions {
  cacheTTL?: number;
  cachePrefix?: string;
  useMock?: boolean;
}

/**
 * Structure d'une réponse d'API généralisée
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Interface pour les filtres de recherche
 */
export interface QueryFilters {
  [key: string]: string | number | boolean | string[] | undefined;
}
