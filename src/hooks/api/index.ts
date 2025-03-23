
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

// Operation queue hooks (placeholders for compatibility)
export const useOperationQueue = () => {
  return {
    addOperation: (operation: () => Promise<any>) => {},
    pending: 0,
    processing: false,
    pauseQueue: () => {},
    resumeQueue: () => {},
    clearQueue: () => {}
  };
};

export interface Operation {
  id: string;
  execute: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface OperationQueueOptions {
  concurrency?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RetryStatus {
  count: number;
  maxRetries: number;
  delay: number;
}

// Retry hook (placeholder for compatibility)
export const useOperationRetry = () => {
  return {
    retry: async (operation: () => Promise<any>, options?: RetryOptions) => {
      return operation();
    }
  };
};

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (retryCount: number, error: Error) => void;
}

export interface RetryStrategy {
  type: 'fixed' | 'exponential';
  initialDelay: number;
  factor?: number;
  maxDelay?: number;
}
