
/**
 * Constantes et configurations de l'application
 */

/**
 * Messages d'erreur standardisés
 */
export const ERROR_MESSAGES = {
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
  SERVER_ERROR: 'Une erreur serveur est survenue, veuillez réessayer plus tard',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides',
  CONNECTION_ERROR: 'Erreur de connexion, veuillez vérifier votre connexion internet',
  TIMEOUT_ERROR: 'La requête a pris trop de temps, veuillez réessayer',
  UNKNOWN_ERROR: 'Une erreur inconnue est survenue',
  NOTION_ERROR: 'Erreur de connexion à Notion',
};

/**
 * Longueurs minimales et maximales pour les champs
 */
export const FIELD_LENGTHS = {
  PROJECT_NAME_MIN: 3,
  PROJECT_NAME_MAX: 100,
  AUDIT_NAME_MIN: 3,
  AUDIT_NAME_MAX: 100,
  URL_MAX: 255,
  COMMENT_MAX: 1000,
  DESCRIPTION_MAX: 2000,
};

/**
 * Format de date par défaut
 */
export const DATE_FORMAT = 'dd/MM/yyyy';

/**
 * Statuts d'affichage des projets
 */
export const PROJECT_STATUS = {
  ALL: 'all',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

/**
 * Nombre d'éléments par page par défaut
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Délai avant de considérer les données comme périmées (en ms)
 */
export const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Routes de l'application
 */
export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_EDIT: '/projects/:id/edit',
  PROJECT_NEW: '/projects/new',
  PROJECT_REQUIREMENTS: '/projects/:id/requirements',
  PROJECT_SAMPLE_PAGES: '/projects/:id/sample-pages',
  AUDIT: '/projects/:projectId/audits/:auditId',
  AUDIT_NEW: '/projects/:projectId/audits/new',
  AUDIT_EVALUATION: '/projects/:projectId/audits/:auditId/evaluation',
  AUDIT_ACTION_PLAN: '/projects/:projectId/audits/:auditId/action-plan',
  CHECKLIST: '/checklist',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};
