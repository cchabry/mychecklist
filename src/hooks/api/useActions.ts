
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { actionsService } from '@/services/api/actionsService';
import { CorrectiveAction } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

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
  // Note: Cette fonction devra être implémentée dans actionsService
  // Pour l'instant, utilisons getAll avec un filtre
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createAction = async (data: Partial<CorrectiveAction>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newAction = await actionsService.create(data);
      return newAction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createAction, isCreating, error };
}

/**
 * Hook pour mettre à jour une action corrective
 */
export function useUpdateAction() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateAction = async (id: string, data: Partial<CorrectiveAction>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedAction = await actionsService.update(id, data);
      return updatedAction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateAction, isUpdating, error };
}

/**
 * Hook pour supprimer une action corrective
 */
export function useDeleteAction() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteAction = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await actionsService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteAction, isDeleting, error };
}
