
/**
 * Types de base pour l'API Notion
 * 
 * Ce module définit les types fondamentaux utilisés dans toute l'API Notion.
 */

import { ApiResponse } from '@/types/api/types';

/**
 * Résultat d'une requête Notion
 * 
 * Type générique qui représente la réponse standard des requêtes vers l'API Notion.
 * 
 * @template T - Type des données retournées en cas de succès
 */
export type NotionResponse<T = any> = ApiResponse<T>;

/**
 * Erreur Notion
 * 
 * Structure d'une erreur retournée par l'API Notion
 */
export interface NotionError {
  /** Message d'erreur lisible */
  message: string;
  /** Code d'erreur optionnel */
  code?: string;
  /** Code HTTP optionnel */
  status?: number;
  /** Détails supplémentaires sur l'erreur */
  details?: any;
}
