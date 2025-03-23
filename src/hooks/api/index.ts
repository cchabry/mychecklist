
// Hooks pour l'accès aux données
export { useActions } from './useActions';
export { useAudits } from './useAudits';
export { useChecklist } from './useChecklist';
export { useEvaluations } from './useEvaluations';
export { useExigences } from './useExigences';
export { usePages } from './usePages';
export { useProjects } from './useProjects';

// Hooks utilitaires
export { useServiceWithCache } from './useServiceWithCache';
export { useServiceWithRetry } from './useServiceWithRetry';
export { useErrorCategorization } from './useErrorCategorization';

// Hooks pour la gestion des opérations
export {
  useOperationQueue,
  useOperationRetry,
  type Operation,
  type OperationQueueOptions,
  type RetryStatus
} from './useOperationQueue';

// Re-export non conflictuel de RetryQueue
export { 
  type RetryQueueHook,
  useRetryQueue 
} from './useOperationRetry';
