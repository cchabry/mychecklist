
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { exigencesService } from '@/services/api/exigencesService';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

/**
 * Hook pour récupérer toutes les exigences
 */
export function useExigences(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<Exigence[]>(
    exigencesService.getAll.bind(exigencesService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer une exigence par son ID
 */
export function useExigence(id: string | undefined, options = {}) {
  return useServiceWithCache<Exigence | null>(
    exigencesService.getById.bind(exigencesService),
    [id],
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
    exigencesService.getByProject.bind(exigencesService),
    [projectId],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour récupérer une exigence spécifique par projet et item
 */
export function useExigenceByProjectAndItem(
  projectId: string | undefined, 
  itemId: string | undefined, 
  options = {}
) {
  return useServiceWithCache<Exigence | null>(
    exigencesService.getByProjectAndItem.bind(exigencesService),
    [projectId, itemId],
    {
      enabled: !!projectId && !!itemId,
      ...options
    }
  );
}

/**
 * Hook pour créer une nouvelle exigence
 */
export function useCreateExigence() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createExigence = async (data: Partial<Exigence>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newExigence = await exigencesService.create(data);
      return newExigence;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createExigence, isCreating, error };
}

/**
 * Hook pour mettre à jour une exigence
 */
export function useUpdateExigence() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateExigence = async (id: string, data: Partial<Exigence>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedExigence = await exigencesService.update(id, data);
      return updatedExigence;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateExigence, isUpdating, error };
}

/**
 * Hook pour définir une exigence (créer ou mettre à jour)
 */
export function useSetExigence() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const setExigence = async (
    projectId: string,
    itemId: string,
    importance: ImportanceLevel,
    comment: string = ''
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await exigencesService.setExigence(
        projectId,
        itemId,
        importance,
        comment
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { setExigence, isProcessing, error };
}

/**
 * Hook pour supprimer une exigence
 */
export function useDeleteExigence() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteExigence = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await exigencesService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteExigence, isDeleting, error };
}
