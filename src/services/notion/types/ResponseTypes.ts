
/**
 * Types pour les réponses des services Notion
 */

/**
 * Structure de réponse standard pour les services Notion
 * 
 * @template T Type des données en cas de succès
 */
export interface NotionResponse<T> {
  /** Indique si l'opération a réussi */
  success: boolean;
  /** Données en cas de succès */
  data?: T;
  /** Informations sur l'erreur en cas d'échec */
  error?: {
    /** Message d'erreur */
    message: string;
    /** Détails supplémentaires sur l'erreur */
    details?: unknown;
  };
}

/**
 * Options de filtre standard pour les requêtes Notion
 */
export interface StandardFilterOptions {
  /** Identifiant du projet */
  projectId?: string;
  /** Identifiant de l'audit */
  auditId?: string;
  /** Identifiant de la page */
  pageId?: string;
  /** Identifiant de l'exigence */
  exigenceId?: string;
  /** Identifiant de l'item de checklist */
  itemId?: string;
  /** Statut */
  status?: string;
  /** Recherche textuelle */
  search?: string;
  /** Options de tri */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Options de pagination */
  pagination?: {
    page: number;
    pageSize: number;
  };
}
