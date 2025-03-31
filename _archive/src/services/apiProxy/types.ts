
/**
 * Types et interfaces pour le système de proxy API modulaire
 */

/**
 * Méthodes HTTP supportées par le proxy API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Types d'environnement de déploiement possibles
 */
export enum DeploymentEnvironment {
  Netlify = 'netlify',
  Vercel = 'vercel',
  Local = 'local',
  Lovable = 'lovable',
  Unknown = 'unknown'
}

/**
 * Configuration pour un adaptateur de proxy API
 */
export interface ProxyAdapterConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  debug?: boolean;
}

/**
 * Structure de réponse standardisée pour toutes les requêtes API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
    details?: any;
  };
}

/**
 * Types d'erreurs que le proxy peut rencontrer
 */
export enum ProxyErrorType {
  Network = 'network',
  Auth = 'authentication',
  Permission = 'permission',
  NotFound = 'not_found',
  Timeout = 'timeout',
  Server = 'server',
  Client = 'client',
  Unknown = 'unknown'
}

/**
 * Structure détaillée d'une erreur de proxy
 */
export interface ProxyError {
  type: ProxyErrorType;
  message: string;
  originalError?: any;
  status?: number;
  endpoint?: string;
  timestamp: number;
}

/**
 * Options pour une requête API
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean | {
    ttl: number; // Durée en secondes
    key?: string; // Clé de cache personnalisée
  };
  retries?: number; // Nombre de réessais en cas d'échec
}

/**
 * Interface que tous les adaptateurs de proxy doivent implémenter
 */
export interface ProxyAdapter {
  /**
   * Nom de l'adaptateur
   */
  readonly name: string;
  
  /**
   * Environnement de déploiement associé
   */
  readonly environment: DeploymentEnvironment;
  
  /**
   * Initialise l'adaptateur avec la configuration fournie
   */
  initialize(config: ProxyAdapterConfig): Promise<boolean>;
  
  /**
   * Vérifie si l'adaptateur est disponible dans l'environnement actuel
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Effectue une requête HTTP via l'adaptateur
   */
  request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>>;
  
  /**
   * Effectue une requête GET
   */
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  
  /**
   * Effectue une requête POST
   */
  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  
  /**
   * Effectue une requête PUT
   */
  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  
  /**
   * Effectue une requête PATCH
   */
  patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  
  /**
   * Effectue une requête DELETE
   */
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}
