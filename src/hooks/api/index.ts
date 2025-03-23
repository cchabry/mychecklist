
// Exports for service hooks with caching
export { useServiceWithCache } from './useServiceWithCache';

// Export custom hooks for specific entities
export { useActions } from './useActions';
export { useAudits } from './useAudits';
export { useChecklistItem } from './useChecklist';
export { useEvaluations } from './useEvaluations';
export { useExigences } from './useExigences';
export { usePages } from './usePages';
export { useProjects } from './useProjects';

// Export types
export type { 
  QueryOptions, 
  QueryFilters 
} from './types';

// Export operation queue hook
export { 
  useOperationQueue,
  type Operation,
  type OperationQueueOptions,
  type RetryStatus
} from './useOperationQueue';

// Export operation retry hook
export { 
  useOperationRetry,
  type RetryOptions,
  type RetryStrategy
} from './useOperationRetry';
