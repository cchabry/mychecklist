
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { evaluationsService } from '@/services/api/evaluationsService';
import { Evaluation } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les évaluations
 */
export function useEvaluations(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<Evaluation[]>(
    evaluationsService.getAll.bind(evaluationsService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer une évaluation par son ID
 */
export function useEvaluation(id: string | undefined, options = {}) {
  return useServiceWithCache<Evaluation | null>(
    evaluationsService.getById.bind(evaluationsService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les évaluations pour un audit spécifique
 */
export function useEvaluationsByAudit(auditId: string | undefined, options = {}) {
  return useServiceWithCache<Evaluation[]>(
    evaluationsService.getByAuditId.bind(evaluationsService),
    [auditId],
    {
      enabled: !!auditId,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les évaluations pour une page spécifique dans un audit
 */
export function useEvaluationsByPage(auditId: string | undefined, pageId: string | undefined, options = {}) {
  return useServiceWithCache<Evaluation[]>(
    async (auditId: string) => {
      const evaluations = await evaluationsService.getByAuditId(auditId);
      return evaluations.filter(evaluation => evaluation.pageId === pageId);
    },
    [auditId],
    {
      enabled: !!auditId && !!pageId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle évaluation
 */
export function useCreateEvaluation() {
  const { execute, isLoading, error, result } = useServiceWithRetry<Evaluation, [Partial<Evaluation>]>(
    evaluationsService.create.bind(evaluationsService),
    'evaluation',
    'create',
    (result) => {
      toast.success('Évaluation créée avec succès');
    }
  );
  
  return { 
    createEvaluation: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour une évaluation
 */
export function useUpdateEvaluation() {
  const { execute, isLoading, error, result } = useServiceWithRetry<Evaluation, [string, Partial<Evaluation>]>(
    evaluationsService.update.bind(evaluationsService),
    'evaluation',
    'update',
    (result) => {
      toast.success('Évaluation mise à jour avec succès');
    }
  );
  
  return { 
    updateEvaluation: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer une évaluation
 */
export function useDeleteEvaluation() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    evaluationsService.delete.bind(evaluationsService),
    'evaluation',
    'delete',
    (result) => {
      toast.success('Évaluation supprimée avec succès');
    }
  );
  
  return { 
    deleteEvaluation: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
