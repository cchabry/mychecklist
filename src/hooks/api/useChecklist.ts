
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { checklistService } from '@/services/api/checklistService';
import { ChecklistItem } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les items de checklist
 */
export function useChecklistItems(options = {}) {
  return useServiceWithCache<ChecklistItem[]>(
    checklistService.getAll.bind(checklistService),
    [],
    options
  );
}

/**
 * Hook pour récupérer un item de la checklist par son ID
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
 * Hook pour récupérer des items de checklist par catégorie
 */
export function useChecklistItemsByCategory(category: string | undefined, options = {}) {
  return useServiceWithCache<ChecklistItem[]>(
    async () => {
      const items = await checklistService.getAll();
      return items.filter(item => item.category === category);
    },
    [category],
    {
      enabled: !!category,
      ...options
    }
  );
}

/**
 * Hook pour créer un nouvel item de checklist
 */
export function useCreateChecklistItem() {
  const { execute, isLoading, error, result } = useServiceWithRetry<ChecklistItem, [Partial<ChecklistItem>]>(
    checklistService.create.bind(checklistService),
    'checklistItem',
    'create',
    (result) => {
      toast.success('Item de checklist créé avec succès');
    }
  );
  
  return { 
    createChecklistItem: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour un item de checklist
 */
export function useUpdateChecklistItem() {
  const { execute, isLoading, error, result } = useServiceWithRetry<ChecklistItem, [string, Partial<ChecklistItem>]>(
    checklistService.update.bind(checklistService),
    'checklistItem',
    'update',
    (result) => {
      toast.success('Item de checklist mis à jour avec succès');
    }
  );
  
  return { 
    updateChecklistItem: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer un item de checklist
 */
export function useDeleteChecklistItem() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    checklistService.delete.bind(checklistService),
    'checklistItem',
    'delete',
    (result) => {
      toast.success('Item de checklist supprimé avec succès');
    }
  );
  
  return { 
    deleteChecklistItem: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
