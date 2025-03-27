
/**
 * Types de base pour l'API
 * 
 * Ce module définit les types de base utilisés dans tous les services API
 */

/**
 * Résultat d'une opération API
 * 
 * Type générique qui représente la réponse standard des opérations d'API,
 * incluant les données en cas de succès ou les détails d'erreur en cas d'échec.
 * 
 * @template T - Type des données retournées en cas de succès
 */
export interface ApiResponse<T = any> {
  /** Indique si l'opération a réussi */
  success: boolean;
  /** Données retournées en cas de succès */
  data?: T;
  /** Informations d'erreur en cas d'échec */
  error?: {
    /** Message d'erreur lisible */
    message: string;
    /** Code d'erreur optionnel */
    code?: string;
    /** Code HTTP optionnel */
    status?: number;
    /** Détails supplémentaires sur l'erreur */
    details?: any;
  };
}

/**
 * Filtre de requête API
 * 
 * Interface pour les filtres appliqués aux requêtes API
 */
export interface ApiFilter {
  /** Champ sur lequel filtrer */
  field: string;
  /** Opérateur de comparaison */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';
  /** Valeur de comparaison */
  value: any;
}

/**
 * Options de requête API
 * 
 * Interface pour les options appliquées aux requêtes API
 */
export interface ApiQueryOptions {
  /** Filtres à appliquer */
  filters?: ApiFilter[];
  /** Nombre d'éléments à retourner */
  limit?: number;
  /** Décalage pour la pagination */
  offset?: number;
  /** Champ sur lequel trier */
  sortBy?: string;
  /** Direction du tri */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Options de pagination API
 * 
 * Interface pour les options de pagination appliquées aux requêtes API
 */
export interface ApiPaginationOptions {
  /** Page actuelle (commence à 1) */
  page: number;
  /** Nombre d'éléments par page */
  pageSize: number;
}

/**
 * Résultat de pagination API
 * 
 * Interface pour les résultats de pagination retournés par les requêtes API
 * 
 * @template T - Type des données retournées
 */
export interface ApiPaginationResult<T = any> {
  /** Données de la page courante */
  data: T[];
  /** Nombre total d'éléments */
  total: number;
  /** Page actuelle */
  page: number;
  /** Nombre de pages total */
  pageCount: number;
  /** Indique s'il existe une page suivante */
  hasNextPage: boolean;
  /** Indique s'il existe une page précédente */
  hasPreviousPage: boolean;
}
