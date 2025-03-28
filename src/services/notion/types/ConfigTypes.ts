
/**
 * Types de configuration pour l'API Notion
 * 
 * Ce module définit les structures de données liées à la configuration
 * du client Notion et des services associés.
 */

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
