
/**
 * Configuration pour le client Notion
 */

/**
 * Configuration du client Notion
 */
export interface NotionConfig {
  /** Clé API */
  apiKey: string;
  /** Mode d'opération (réel ou démo) */
  mode: 'real' | 'demo';
  /** ID de la base de données des projets */
  projectsDbId: string;
  /** ID de la base de données des audits */
  auditsDbId: string;
  /** ID de la base de données des exigences */
  exigencesDbId: string;
  /** ID de la base de données des pages d'échantillon */
  pagesDbId: string;
  /** ID de la base de données des évaluations */
  evaluationsDbId: string;
  /** ID de la base de données de la checklist */
  checklistDbId: string;
  /** ID de la base de données des actions */
  actionsDbId: string;
  /** ID de la base de données des progrès */
  progressDbId: string;
}
