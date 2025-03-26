
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { evaluationsService } from '@/services/api/evaluationsService';
import { Evaluation } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les évaluations
 */
export function useEvaluations(filters?: QueryFilters) {
  return useServiceWithCache<Evaluation[]>(
    () => evaluationsService.getAll(filters),
    [filters],
    {
      cacheKey: `evaluations_${JSON.stringify(filters || {})}`
    }
  );
}

/**
 * Hook pour récupérer une évaluation par son ID
 */
export function useEvaluation(id: string | undefined) {
  return useServiceWithCache<Evaluation | null>(
    () => evaluationsService.getById(id || ''),
    [id],
    {
      cacheKey: `evaluation_${id}`,
      enabled: !!id
    }
  );
}

/**
 * Hook pour récupérer les évaluations pour un audit spécifique
 */
export function useEvaluationsByAudit(auditId: string | undefined) {
  return useServiceWithCache<Evaluation[]>(
    () => evaluationsService.getByAuditId(auditId || ''),
    [auditId],
    {
      cacheKey: `evaluations_audit_${auditId}`,
      enabled: !!auditId
    }
  );
}

/**
 * Hook pour récupérer les évaluations pour une page spécifique dans un audit
 */
export function useEvaluationsByPage(auditId: string | undefined, pageId: string | undefined) {
  return useServiceWithCache<Evaluation[]>(
    async () => {
      if (!auditId || !pageId) return [];
      const evaluations = await evaluationsService.getByAuditId(auditId);
      return evaluations.filter(evaluation => evaluation.pageId === pageId);
    },
    [auditId, pageId],
    {
      cacheKey: `evaluations_audit_${auditId}_page_${pageId}`,
      enabled: !!auditId && !!pageId
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
