
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { checklistService } from '@/services/api/checklistService';
import { ChecklistItem } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

/**
 * Hook pour récupérer tous les items de checklist
 */
export function useChecklistItems(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<ChecklistItem[]>(
    checklistService.getAll.bind(checklistService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer un item de checklist par son ID
 */
export function useChecklistItem(id: string | undefined, options = {}) {
  return useServiceWithCache<ChecklistItem | null>(
    checklistService.getById.bind(checklistService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les items de checklist par catégorie
 */
export function useChecklistItemsByCategory(category: string | undefined, options = {}) {
  return useServiceWithCache<ChecklistItem[]>(
    checklistService.getByCategory.bind(checklistService),
    [category],
    {
      enabled: !!category,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les catégories distinctes
 */
export function useChecklistCategories(options = {}) {
  return useServiceWithCache<string[]>(
    checklistService.getCategories.bind(checklistService),
    [],
    options
  );
}

/**
 * Hook pour récupérer les sous-catégories distinctes pour une catégorie
 */
export function useChecklistSubcategories(category?: string, options = {}) {
  return useServiceWithCache<string[]>(
    checklistService.getSubcategories.bind(checklistService),
    [category],
    options
  );
}

/**
 * Hook pour créer un nouvel item de checklist
 */
export function useCreateChecklistItem() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createChecklistItem = async (data: Partial<ChecklistItem>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newItem = await checklistService.create(data);
      return newItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createChecklistItem, isCreating, error };
}

/**
 * Hook pour mettre à jour un item de checklist
 */
export function useUpdateChecklistItem() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateChecklistItem = async (id: string, data: Partial<ChecklistItem>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedItem = await checklistService.update(id, data);
      return updatedItem;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateChecklistItem, isUpdating, error };
}

/**
 * Hook pour supprimer un item de checklist
 */
export function useDeleteChecklistItem() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteChecklistItem = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await checklistService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteChecklistItem, isDeleting, error };
}
