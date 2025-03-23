
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { exigencesService } from '@/services/api/exigencesService';
import { Exigence } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les exigences
 */
export function useExigences(options = {}) {
  return useServiceWithCache<Exigence[]>(
    () => exigencesService.getAll(),
    [],
    options
  );
}

/**
 * Hook pour récupérer une exigence par son ID
 */
export function useExigence(id: string | undefined, options = {}) {
  return useServiceWithCache<Exigence | null>(
    () => exigencesService.getById(id || ''),
    [],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les exigences pour un projet spécifique
 */
export function useExigencesByProject(projectId: string | undefined, options = {}) {
  return useServiceWithCache<Exigence[]>(
    async () => {
      if (!projectId) return [];
      const exigences = await exigencesService.getAll();
      return exigences.filter(exigence => exigence.projectId === projectId);
    },
    [],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle exigence
 */
export function useCreateExigence() {
  const { execute, isLoading, error, result } = useServiceWithRetry<Exigence, [Partial<Exigence>]>(
    exigencesService.create.bind(exigencesService),
    'exigence',
    'create',
    (result) => {
      toast.success('Exigence créée avec succès');
    }
  );
  
  return { 
    createExigence: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour une exigence
 */
export function useUpdateExigence() {
  const { execute, isLoading, error, result } = useServiceWithRetry<Exigence, [string, Partial<Exigence>]>(
    exigencesService.update.bind(exigencesService),
    'exigence',
    'update',
    (result) => {
      toast.success('Exigence mise à jour avec succès');
    }
  );
  
  return { 
    updateExigence: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer une exigence
 */
export function useDeleteExigence() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    exigencesService.delete.bind(exigencesService),
    'exigence',
    'delete',
    (result) => {
      toast.success('Exigence supprimée avec succès');
    }
  );
  
  return { 
    deleteExigence: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
