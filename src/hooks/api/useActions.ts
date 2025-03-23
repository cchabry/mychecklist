
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { actionsService } from '@/services/api/actionsService';
import { CorrectiveAction } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les actions correctives
 */
export function useActions(options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    actionsService.getAll.bind(actionsService),
    [],
    options
  );
}

/**
 * Hook pour récupérer une action corrective par son ID
 */
export function useAction(id: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction | null>(
    () => actionsService.getById(id || ''),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les actions correctives pour un audit
 */
export function useActionsByAudit(auditId: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    async () => {
      if (!auditId) return [];
      const actions = await actionsService.getAll();
      // On filtre les actions qui sont liées à l'audit via les évaluations
      return actions.filter(action => action.evaluationId.startsWith(`eval_${auditId}`));
    },
    [auditId],
    {
      enabled: !!auditId,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les actions correctives pour une évaluation
 */
export function useActionsByEvaluation(evaluationId: string | undefined, options = {}) {
  return useServiceWithCache<CorrectiveAction[]>(
    async () => {
      if (!evaluationId) return [];
      const actions = await actionsService.getAll();
      return actions.filter(action => action.evaluationId === evaluationId);
    },
    [evaluationId],
    {
      enabled: !!evaluationId,
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
