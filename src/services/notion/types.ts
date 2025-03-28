
/**
 * Types pour le service Notion
 * 
 * Ce module définit les interfaces et types utilisés pour interagir avec l'API Notion
 * ainsi que les structures de données communes pour les opérations sur cette API.
 */
import { ApiResponse } from '@/types/api/types';

/**
 * Configuration du client Notion
 * 
 * Paramètres de configuration pour le client Notion
 */
export interface NotionConfig {
  /** Clé d'API Notion */
  apiKey?: string;
  /** ID de la base de données des projets */
  projectsDbId?: string;
  /** ID de la base de données des items de checklist */
  checklistsDbId?: string;
  /** ID de la base de données des audits */
  auditsDbId?: string;
  /** ID de la base de données des pages d'échantillon */
  pagesDbId?: string;
  /** ID de la base de données des exigences */
  exigencesDbId?: string;
  /** ID de la base de données des évaluations */
  evaluationsDbId?: string;
  /** ID de la base de données des actions correctives */
  actionsDbId?: string;
  /** Activer le mode mock (données simulées) */
  mockMode?: boolean;
  /** Activer le mode debug (logs détaillés) */
  debug?: boolean;
}

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

/**
 * Statut de connexion
 * 
 * Énumération des différents statuts possibles pour la connexion à l'API Notion
 */
export enum ConnectionStatus {
  /** Connecté à l'API Notion */
  Connected = 'connected',
  /** Déconnecté de l'API Notion */
  Disconnected = 'disconnected',
  /** Erreur de connexion à l'API Notion */
  Error = 'error',
  /** Connexion en cours */
  Loading = 'loading'
}

/**
 * Résultat du test de connexion
 * 
 * Informations retournées par le test de connexion à l'API Notion
 */
export interface ConnectionTestResult {
  /** Indique si le test a réussi */
  success: boolean;
  /** Utilisateur connecté, si le test a réussi */
  user?: string;
  /** Nom de l'espace de travail, si le test a réussi */
  workspaceName?: string;
  /** Nom de la base de données des projets, si le test a réussi */
  projectsDbName?: string;
  /** Nom de la base de données des items de checklist, si le test a réussi */
  checklistsDbName?: string;
  /** Message d'erreur, si le test a échoué */
  error?: string;
  /** Détails de l'erreur, si le test a échoué */
  details?: any;
}

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
 * Propriété multi-select Notion
 */
export interface NotionMultiSelectProperty {
  /** Type de propriété */
  type: 'multi_select';
  /** Valeurs sélectionnées */
  multi_select: Array<{ name: string; color?: string; id?: string }>;
}

/**
 * Propriété select Notion
 */
export interface NotionSelectProperty {
  /** Type de propriété */
  type: 'select';
  /** Valeur sélectionnée */
  select: { name: string; color?: string; id?: string } | null;
}

/**
 * Propriété texte Notion
 */
export interface NotionRichTextProperty {
  /** Type de propriété */
  type: 'rich_text';
  /** Contenu textuel */
  rich_text: Array<{
    type: 'text';
    text: { content: string };
    annotations?: Record<string, boolean>;
    plain_text?: string;
  }>;
}

/**
 * Propriété numérique Notion
 */
export interface NotionNumberProperty {
  /** Type de propriété */
  type: 'number';
  /** Valeur numérique */
  number: number | null;
}

/**
 * Propriété titre Notion
 */
export interface NotionTitleProperty {
  /** Type de propriété */
  type: 'title';
  /** Contenu du titre */
  title: Array<{
    type: 'text';
    text: { content: string };
    annotations?: Record<string, boolean>;
    plain_text?: string;
  }>;
}

/**
 * Propriété date Notion
 */
export interface NotionDateProperty {
  /** Type de propriété */
  type: 'date';
  /** Valeur de date */
  date: {
    start: string;
    end?: string;
    time_zone?: string;
  } | null;
}

/**
 * Propriété URL Notion
 */
export interface NotionUrlProperty {
  /** Type de propriété */
  type: 'url';
  /** Valeur URL */
  url: string | null;
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
