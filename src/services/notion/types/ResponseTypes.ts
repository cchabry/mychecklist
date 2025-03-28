
/**
 * Types de réponse pour l'API Notion
 * 
 * Ce module définit les structures de données retournées par l'API Notion.
 */

/**
 * Base de données Notion
 * 
 * Représentation d'une base de données dans Notion
 */
export interface NotionDatabase {
  /** Identifiant unique de la base de données */
  id: string;
  /** Titre de la base de données */
  title: Array<{ plain_text: string }>;
  /** Propriétés de la base de données */
  properties: Record<string, any>;
  /** URL de la base de données */
  url?: string;
  /** Propriétés d'affichage de la base de données */
  display?: Record<string, any>;
}

/**
 * Page Notion
 * 
 * Représentation d'une page dans Notion
 */
export interface NotionPage {
  /** Identifiant unique de la page */
  id: string;
  /** Horodatage de création */
  created_time: string;
  /** Horodatage de dernière modification */
  last_edited_time: string;
  /** Identifiant du parent (base de données ou page) */
  parent?: { database_id?: string; page_id?: string };
  /** Propriétés de la page */
  properties: Record<string, any>;
  /** URL de la page */
  url?: string;
  /** Contenu de la page */
  content?: Array<any>;
}

/**
 * Résultat de requête paginée Notion
 * 
 * @template T - Type des données retournées
 */
export interface NotionPaginatedResult<T = any> {
  /** Liste des résultats pour la page courante */
  results: T[];
  /** Indique s'il existe plus de résultats */
  has_more: boolean;
  /** Curseur pour la page suivante */
  next_cursor: string | null;
}
