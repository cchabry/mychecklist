
/**
 * Point d'entrée pour tous les hooks de l'application
 * 
 * Ce module exporte tous les hooks organisés par catégorie
 * pour maintenir la cohérence et faciliter l'importation.
 */

// Hooks d'API
export * from './api';

// Hooks de gestion des erreurs
export * from './error';

// Hooks de formulaires
export * from './form';

// Hooks de cache
export * from './cache';

// Hooks Notion
export * from './notion';

// Hooks génériques
export * from './use-toast';
export * from './useOperationMode';
export * from './useProjects';
export * from './useProjectById';
export * from './useProjectAudits';
