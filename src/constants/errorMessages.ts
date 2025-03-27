
/**
 * Constantes pour les messages d'erreur
 * 
 * Ce fichier centralise tous les messages d'erreur utilisés dans l'application
 * pour garantir la cohérence entre les services et les tests.
 */

// Messages d'erreur génériques
export const GENERIC_ERROR = 'Une erreur inattendue est survenue';
export const NOT_FOUND_ERROR = 'Ressource non trouvée';
export const VALIDATION_ERROR = 'Erreur de validation des données';

// Messages d'erreur spécifiques aux opérations
export const DELETE_ERROR = 'Erreur lors de la suppression';
export const CREATE_ERROR = 'Erreur lors de la création';
export const UPDATE_ERROR = 'Erreur lors de la mise à jour';
export const FETCH_ERROR = 'Erreur lors de la récupération des données';

// Messages d'erreur spécifiques à Notion
export const NOTION_CONNECTION_ERROR = 'Erreur de connexion à Notion';
export const NOTION_CONFIGURATION_ERROR = 'Configuration Notion invalide';

// Messages d'erreur spécifiques au mode opérationnel
export const OPERATION_MODE_RESET = 'Réinitialisation du mode';
export const OPERATION_MODE_SWITCH = 'Changement de mode opérationnel';

// Messages d'erreur spécifiques aux actions
export const ACTION_NOT_FOUND = 'Action non trouvée';
export const ACTION_INVALID_STATUS = 'Statut d\'action invalide';

// Messages d'erreur spécifiques aux audits
export const AUDIT_NOT_FOUND = 'Audit non trouvé';
export const AUDIT_ALREADY_EXISTS = 'Un audit avec ce nom existe déjà pour ce projet';

// Messages d'erreur pour les évaluations
export const EVALUATION_NOT_FOUND = 'Évaluation non trouvée';
export const EVALUATION_INVALID_SCORE = 'Score d\'évaluation invalide';

// Messages d'erreur pour les exigences
export const EXIGENCE_NOT_FOUND = 'Exigence non trouvée';
export const EXIGENCE_DUPLICATE = 'Une exigence existe déjà pour cet item dans ce projet';

// Messages d'erreur pour l'authentification
export const AUTH_REQUIRED = 'Authentification requise';
export const AUTH_INVALID = 'Identifiants invalides';
export const AUTH_EXPIRED = 'Session expirée';
