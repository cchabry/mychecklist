
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { actionsService } from '@/services/api/actionsService';
import { CorrectiveAction } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les actions correctives
 */
export function useActions(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    actionsService.getAll.bind(actionsService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer une action corrective par son ID
 */
export function useAction(id: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction | null>(
    actionsService.getById.bind(actionsService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les actions correctives liées à une évaluation
 */
export function useActionsByEvaluation(evaluationId: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    actionsService.getByEvaluationId.bind(actionsService),
    [evaluationId],
    {
      enabled: !!evaluationId,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les actions correctives pour un audit
 */
export function useActionsByAudit(auditId: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    actionsService.getAll.bind(actionsService),
    [undefined, { auditId }],
    {
      enabled: !!auditId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle action corrective
 */
export function useCreateAction() {
  const { execute, isLoading, error, result } = useServiceWithRetry<CorrectiveAction, [Partial<CorrectiveAction>]>(
    actionsService.create.bind(actionsService),
    'action',
    'create',
    (result) => {
      toast.success('Action corrective créée avec succès');
    }
  );
  
  return { 
    createAction: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour une action corrective
 */
export function useUpdateAction() {
  const { execute, isLoading, error, result } = useServiceWithRetry<CorrectiveAction, [string, Partial<CorrectiveAction>]>(
    actionsService.update.bind(actionsService),
    'action',
    'update',
    (result) => {
      toast.success('Action corrective mise à jour avec succès');
    }
  );
  
  return { 
    updateAction: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer une action corrective
 */
export function useDeleteAction() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    actionsService.delete.bind(actionsService),
    'action',
    'delete',
    (result) => {
      toast.success('Action corrective supprimée avec succès');
    }
  );
  
  return { 
    deleteAction: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
