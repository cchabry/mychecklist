
/**
 * Types de base pour les API
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

// Alias pour compatibilité
export type NotionResponse<T = any> = ApiResponse<T>;
