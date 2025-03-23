
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { projectsService } from '@/services/api/projectsService';
import { Project } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

/**
 * Hook pour récupérer tous les projets
 */
export function useProjects(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<Project[]>(
    projectsService.getAll.bind(projectsService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer un projet par son ID
 */
export function useProject(id: string | undefined, options = {}) {
  return useServiceWithCache<Project | null>(
    projectsService.getById.bind(projectsService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les projets actifs (non archivés)
 */
export function useActiveProjects(options = {}) {
  return useServiceWithCache<Project[]>(
    projectsService.getActiveProjects.bind(projectsService),
    [],
    options
  );
}

/**
 * Hook pour créer un nouveau projet
 */
export function useCreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createProject = async (data: Partial<Project>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newProject = await projectsService.create(data);
      return newProject;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createProject, isCreating, error };
}

/**
 * Hook pour mettre à jour un projet
 */
export function useUpdateProject() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateProject = async (id: string, data: Partial<Project>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedProject = await projectsService.update(id, data);
      return updatedProject;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateProject, isUpdating, error };
}

/**
 * Hook pour supprimer un projet
 */
export function useDeleteProject() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteProject = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await projectsService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteProject, isDeleting, error };
}
