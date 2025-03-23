
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { pagesService } from '@/services/api/pagesService';
import { SamplePage } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les pages d'échantillon
 */
export function usePages(options = {}) {
  return useServiceWithCache<SamplePage[]>(
    pagesService.getAll.bind(pagesService),
    [],
    options
  );
}

/**
 * Hook pour récupérer une page d'échantillon par son ID
 */
export function usePage(id: string | undefined, options = {}) {
  return useServiceWithCache<SamplePage | null>(
    () => pagesService.getById(id || ''),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les pages d'échantillon pour un projet spécifique
 */
export function usePagesByProject(projectId: string | undefined, options = {}) {
  return useServiceWithCache<SamplePage[]>(
    async () => {
      if (!projectId) return [];
      const pages = await pagesService.getAll();
      return pages.filter(page => page.projectId === projectId);
    },
    [projectId],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle page d'échantillon
 */
export function useCreatePage() {
  const { execute, isLoading, error, result } = useServiceWithRetry<SamplePage, [Partial<SamplePage>]>(
    pagesService.create.bind(pagesService),
    'page',
    'create',
    (result) => {
      toast.success('Page d\'échantillon créée avec succès');
    }
  );
  
  return { 
    createPage: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour une page d'échantillon
 */
export function useUpdatePage() {
  const { execute, isLoading, error, result } = useServiceWithRetry<SamplePage, [string, Partial<SamplePage>]>(
    pagesService.update.bind(pagesService),
    'page',
    'update',
    (result) => {
      toast.success('Page d\'échantillon mise à jour avec succès');
    }
  );
  
  return { 
    updatePage: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer une page d'échantillon
 */
export function useDeletePage() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    pagesService.delete.bind(pagesService),
    'page',
    'delete',
    (result) => {
      toast.success('Page d\'échantillon supprimée avec succès');
    }
  );
  
  return { 
    deletePage: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
