
import { useState, useCallback } from 'react';
import { ChecklistItem } from '@/lib/types';
import { useServiceWithCache } from './useServiceWithCache';
import { checklistService } from '@/services/api/checklistService';
import { QueryFilters } from './types';

/**
 * Hook pour interagir avec les items de checklist
 */
export function useChecklistItem(filters?: QueryFilters) {
  const {
    data: items,
    isLoading,
    error,
    fetchData,
    invalidateCache,
    reload
  } = useServiceWithCache<ChecklistItem[]>(
    () => checklistService.getAll(filters),
    [],
    {
      cacheKey: `checklist_${JSON.stringify(filters || {})}`,
      immediate: true
    }
  );

  const getChecklistItem = useCallback(async (id: string) => {
    return checklistService.getById(id);
  }, []);

  const createChecklistItem = useCallback(async (data: Partial<ChecklistItem>) => {
    const newItem = await checklistService.create(data);
    invalidateCache();
    return newItem;
  }, [invalidateCache]);

  const updateChecklistItem = useCallback(async (id: string, data: Partial<ChecklistItem>) => {
    const updatedItem = await checklistService.update(id, data);
    invalidateCache();
    return updatedItem;
  }, [invalidateCache]);

  const deleteChecklistItem = useCallback(async (id: string) => {
    const result = await checklistService.delete(id);
    invalidateCache();
    return result;
  }, [invalidateCache]);

  const getCategories = useCallback(async () => {
    const allItems = items || await checklistService.getAll();
    const categories = [...new Set(allItems.map(item => item.category))].sort();
    return categories;
  }, [items]);

  return {
    items,
    isLoading,
    error,
    fetchData,
    reload,
    getChecklistItem,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    getCategories
  };
}
