
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { evaluationsService } from '@/services/api/evaluationsService';
import { Evaluation } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

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
  // Note: Cette fonction devra être implémentée dans evaluationsService
  // Pour l'instant, utilisons getByAuditId avec un filtrage local
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createEvaluation = async (data: Partial<Evaluation>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newEvaluation = await evaluationsService.create(data);
      return newEvaluation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createEvaluation, isCreating, error };
}

/**
 * Hook pour mettre à jour une évaluation
 */
export function useUpdateEvaluation() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateEvaluation = async (id: string, data: Partial<Evaluation>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedEvaluation = await evaluationsService.update(id, data);
      return updatedEvaluation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateEvaluation, isUpdating, error };
}

/**
 * Hook pour supprimer une évaluation
 */
export function useDeleteEvaluation() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteEvaluation = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await evaluationsService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteEvaluation, isDeleting, error };
}
