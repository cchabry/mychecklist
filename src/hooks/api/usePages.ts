
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { pagesService } from '@/services/api/pagesService';
import { SamplePage } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

/**
 * Hook pour récupérer toutes les pages d'échantillon
 */
export function usePages(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<SamplePage[]>(
    pagesService.getAll.bind(pagesService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer une page par son ID
 */
export function usePage(id: string | undefined, options = {}) {
  return useServiceWithCache<SamplePage | null>(
    pagesService.getById.bind(pagesService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les pages pour un projet spécifique
 */
export function usePagesByProject(projectId: string | undefined, options = {}) {
  return useServiceWithCache<SamplePage[]>(
    pagesService.getByProject.bind(pagesService),
    [projectId],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle page
 */
export function useCreatePage() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createPage = async (data: Partial<SamplePage>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newPage = await pagesService.create(data);
      return newPage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createPage, isCreating, error };
}

/**
 * Hook pour mettre à jour une page
 */
export function useUpdatePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updatePage = async (id: string, data: Partial<SamplePage>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedPage = await pagesService.update(id, data);
      return updatedPage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updatePage, isUpdating, error };
}

/**
 * Hook pour supprimer une page
 */
export function useDeletePage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deletePage = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await pagesService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deletePage, isDeleting, error };
}

/**
 * Hook pour réorganiser les pages
 */
export function useReorderPages() {
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const reorderPages = async (projectId: string, newOrder: string[]) => {
    setIsReordering(true);
    setError(null);
    
    try {
      const success = await pagesService.reorderPages(projectId, newOrder);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsReordering(false);
    }
  };
  
  return { reorderPages, isReordering, error };
}
