
/**
 * Réexportation de tous les hooks de l'application
 * pour faciliter leur import depuis un emplacement central
 */

// Hooks génériques
export * from './use-mobile';
export * from './use-toast';

// Hooks spécifiques
export * from './useAuditData';
export * from './useAuditProjectData';
export * from './useAuditSaving';
export * from './useAuditState';
export * from './useCache';
export * from './useChecklist';
export * from './useChecklistAndExigences';
export * from './useErrorHandling';
export * from './useErrorReporter';

// Hooks d'API - importations individuelles pour éviter les conflits
export { 
  useServiceWithCache,
  useServiceWithRetry,
  useOperationQueue
} from './api';

// Hooks de service pour l'API - importations individuelles pour éviter les conflits
export { useProjects, useProject, useActiveProjects } from './api/useProjects';
export { useAudits } from './api/useAudits';
export { useChecklistItem } from './api/useChecklistItem';
export { usePages, usePage, usePagesByProject } from './api/usePages';
export { useExigence, useExigencesByProject } from './api/useExigences';
export { useEvaluations, useEvaluation, useEvaluationsByAudit, useEvaluationsByPage } from './api/useEvaluations';
export { useActions, useAction, useActionsByAudit, useActionsByEvaluation } from './api/useActions';

// Hooks pour Notion
export * from './notion';

// Hooks pour le cache
export * from './cache';
