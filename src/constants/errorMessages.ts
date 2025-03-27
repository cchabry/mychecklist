
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
