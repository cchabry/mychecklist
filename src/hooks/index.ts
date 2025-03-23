
// Hooks pour la gestion des erreurs
export * from './useErrorHandling';
export * from './useRecoveryStrategies';
export * from './useErrorReporter';

// Hooks pour l'API et le cache (avec imports explicites pour éviter les conflits)
export {
  useActions,
  useAudits,
  useChecklistItem,
  useChecklist,
  useEvaluations,
  useExigences,
  usePages,
  useProjects,
  useServiceWithCache
} from './api';

// Custom re-export pour résoudre les conflits de RetryOptions et RetryStrategy
export {
  useOperationQueue,
  useOperationRetry,
  OperationQueueOptions,
  RetryStatus,
  type Operation
} from './api';

// Hooks pour Notion
export * from './notion';

// Hook pour le mode opérationnel
export * from './useOperationModeListener';

// Hooks pour le cache
export * from './useCache';
