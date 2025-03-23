
import { useState, useCallback } from 'react';
import { CorrectiveAction } from '@/lib/types';
import { useServiceWithCache } from './useServiceWithCache';
import { actionsService } from '@/services/api/actionsService';
import { QueryFilters } from './types';

/**
 * Hook pour gérer les actions correctives
 */
export function useActions(filters?: QueryFilters) {
  const {
    data: actions,
    isLoading,
    error,
    fetchData,
    invalidateCache,
    reload
  } = useServiceWithCache<CorrectiveAction[]>(
    () => actionsService.getAll(filters),
    {
      cacheKey: `actions_${JSON.stringify(filters || {})}`,
      immediate: true
    }
  );

  const getAction = useCallback(async (id: string) => {
    return actionsService.getById(id);
  }, []);

  const createAction = useCallback(async (data: Partial<CorrectiveAction>) => {
    const newAction = await actionsService.create(data);
    invalidateCache();
    return newAction;
  }, [invalidateCache]);

  const updateAction = useCallback(async (id: string, data: Partial<CorrectiveAction>) => {
    const updatedAction = await actionsService.update(id, data);
    invalidateCache();
    return updatedAction;
  }, [invalidateCache]);

  const getActionsByEvaluationId = useCallback(async (evaluationId: string) => {
    return actionsService.getAll({ evaluationId });
  }, []);

  const deleteAction = useCallback(async (id: string) => {
    const result = await actionsService.delete(id);
    invalidateCache();
    return result;
  }, [invalidateCache]);

  return {
    actions,
    isLoading,
    error,
    fetchData,
    reload,
    getAction,
    createAction,
    updateAction,
    getActionsByEvaluationId,
    deleteAction
  };
}
